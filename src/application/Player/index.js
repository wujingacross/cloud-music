import React, { useRef, useState, useEffect, memo } from "react";
import { connect } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";
import MiniPlayer from './miniPlayer';
import NormalPlayer from './normalPlayer';
import PlayList from './playList/index';
import { playMode } from '../../api/config';
import Toast from "./../../baseUI/toast/index";
import { getLyricRequest } from "../../api/request";
import { getSongUrl, isEmptyObject, shuffle, findIndex } from '../../api/utils';
import Lyric from './../../api/lyric-parser';

function Player (props) {
    const { fullScreen, playing, currentIndex, playList:immutablePlayList, currentSong: immutableCurrentSong, 
        mode, sequencePlayList:immutableSequencePlayList } = props;
    const { toggleFullScreenDispatch, togglePlayingDispatch, changeCurrentIndexDispatch, changeCurrentDispatch, 
        changePlayListDispatch, changeModeDispatch, togglePlayListDispatch } = props;
    const audioRef = useRef ();
    // 目前播放时间
    const [currentTime, setCurrentTime] = useState (0);
    // 歌曲总时长
    const [duration, setDuration] = useState (0);
    // 歌曲播放进度
    let percent = isNaN (currentTime /duration) ? 0 : currentTime /duration;
    // 记录当前的歌曲，以便于下次重渲染时比对是否是一首歌
    const [preSong, setPreSong] = useState ({});
    const [modeText, setModeText] = useState ("");
    const [songReady, setSongReady] = useState (true);
    const [currentPlayingLyric, setPlayingLyric] = useState ("");
    const toastRef = useRef ();
    const currentLyric = useRef ();
    const currentLineNum = useRef (0);

    const playList = immutablePlayList.toJS();
    let currentSong = immutableCurrentSong.toJS ();
    const sequencePlayList = immutableSequencePlayList.toJS ();

    const getLyric = id => {
      let lyric = "";
      if (currentLyric.current) {
        currentLyric.current.stop ();
      }
      // 避免 songReady 恒为 false 的情况
      getLyricRequest (id)
        .then (data => {
          console.log (data)
          lyric = data.lrc.lyric;
          if (!lyric) {
            currentLyric.current = null;
            return;
          }
          currentLyric.current = new Lyric(lyric, handleLyric);
          console.log('1233', currentLyric.current);
          currentLyric.current.play ();
          currentLineNum.current = 0;
          currentLyric.current.seek (0);
        })
        .catch (() => {
          songReady.current = true;
          audioRef.current.play ();
        });
    };

    const handleLyric = ({lineNum, txt}) => {
      if (!currentLyric.current) return;
      currentLineNum.current = lineNum;
      setPlayingLyric(txt);
    };

    useEffect (() => {
        if (
            !playList.length ||
            currentIndex === -1 ||
            !playList[currentIndex] ||
            playList[currentIndex].id === preSong.id ||
            !songReady// 标志位为 false
        )
            return;
        let current = playList[currentIndex] || {};
        setPreSong (current);
        setSongReady (false); // 把标志位置为 false, 表示现在新的资源没有缓冲完成，不能切歌
        changeCurrentDispatch (current);// 赋值 currentSong
        audioRef.current.src = getSongUrl(current.id);
        setTimeout (() => {
            audioRef.current && audioRef.current.play ();
            setSongReady (true);
        });
        togglePlayingDispatch (true);// 播放状态
        getLyric (current.id);
        setCurrentTime (0);// 从头开始播放
        setDuration ((current.dt/ 1000) | 0);// 时长
    }, [playList, currentIndex]);

    useEffect (() => {
        playing ? audioRef.current.play () : audioRef.current.pause ();
      }, [playing]);

    // // mock
    // const currentSong = {
    //     al: { picUrl: "https://p1.music.126.net/JL_id1CFwNJpzgrXwemh4Q==/109951164172892390.jpg" },
    //     name: "木偶人",
    //     ar: [{name: "薛之谦"}]
    // }

    const clickPlaying = (e, state) => {
        e.stopPropagation ();
        togglePlayingDispatch (state);
        if (currentLyric.current) {
          currentLyric.current.togglePlay (currentTime*1000);
        }
    };

    const updateTime = e => {
        setCurrentTime (e.target.currentTime);
    };

    const onProgressChange = curPercent => {
        const newTime = curPercent * duration;
        setCurrentTime (newTime);
        audioRef.current.currentTime = newTime;
        if (!playing) {
          togglePlayingDispatch (true);
        }
        if (currentLyric.current) {
          currentLyric.current.seek (newTime * 1000);
        }
    };

    // 一首歌循环
    const handleLoop = () => {
        audioRef.current.currentTime = 0;
        changePlayingState (true);
        audioRef.current.play ();
    };
    
    const handlePrev = () => {
        // 播放列表只有一首歌时单曲循环
        if (playList.length === 1) {
            handleLoop ();
        return;
        }
        let index = currentIndex - 1;
        if (index < 0) index = playList.length - 1;
        if (!playing) togglePlayingDispatch (true);
        changeCurrentIndexDispatch (index);
    };
    
    const handleNext = () => {
        // 播放列表只有一首歌时单曲循环
        if (playList.length === 1) {
            handleLoop ();
        return;
        }
        let index = currentIndex + 1;
        if (index === playList.length) index = 0;
        if (!playing) togglePlayingDispatch (true);
        changeCurrentIndexDispatch (index);
    };

    // 切换播放模式
    const changeMode = () => {
        let newMode = (mode + 1) % 3;
        if (newMode === 0) {
          // 顺序模式
          changePlayListDispatch(sequencePlayList);
          let index = findIndex(currentSong, sequencePlayList);
          changeCurrentIndexDispatch (index);
          setModeText ("顺序循环");
        } else if (newMode === 1) {
          // 单曲循环
          changePlayListDispatch(sequencePlayList);
          setModeText ("单曲循环");
        } else if (newMode === 2) {
          // 随机播放
          let newList = shuffle(sequencePlayList);
          let index = findIndex(currentSong, newList);
          changePlayListDispatch(newList);
          changeCurrentIndexDispatch(index);
          setModeText ("随机播放");
        }
        changeModeDispatch(newMode);
        toastRef.current.show();
    };

    const handleEnd = () => {
        if (mode === playMode.loop) {
          handleLoop();
        } else {
          handleNext();
        }
      };

    return (
        <div>
            {isEmptyObject(currentSong) ? null : (
                <>
                    <MiniPlayer 
                        song={currentSong} 
                        fullScreen={fullScreen} 
                        toggleFullScreenDispatch={toggleFullScreenDispatch} 
                        playing={playing}
                        percent={percent}// 进度
                        clickPlaying={clickPlaying}
                        togglePlayList={togglePlayListDispatch}
                    />
                     <NormalPlayer 
                        song={currentSong}
                        fullScreen={fullScreen}
                        toggleFullScreenDispatch={toggleFullScreenDispatch}
                        playing={playing}
                        clickPlaying={clickPlaying}
                        duration={duration}// 总时长
                        currentTime={currentTime}// 播放时间
                        percent={percent}// 进度
                        onProgressChange={onProgressChange}
                        mode={mode}
                        changeMode={changeMode}
                        handlePrev={handlePrev}
                        handleNext={handleNext}
                        togglePlayList={togglePlayListDispatch}
                        currentLyric={currentLyric.current}
                        currentPlayingLyric={currentPlayingLyric}
                        currentLineNum={currentLineNum.current}
                    />
                </>
            )}
            <audio ref={audioRef} onTimeUpdate={updateTime} onEnded={handleEnd}></audio>
            <PlayList />
            <Toast text={modeText} ref={toastRef}></Toast>  
        </div>
    )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = state => ({
  fullScreen: state.getIn (["player", "fullScreen"]),
  playing: state.getIn (["player", "playing"]),
  currentSong: state.getIn (["player", "currentSong"]),
  showPlayList: state.getIn (["player", "showPlayList"]),
  mode: state.getIn (["player", "mode"]),
  currentIndex: state.getIn (["player", "currentIndex"]),
  playList: state.getIn (["player", "playList"]),
  sequencePlayList: state.getIn (["player", "sequencePlayList"])
});

// 映射 dispatch 到 props 上
const mapDispatchToProps = dispatch => {
  return {
    togglePlayingDispatch (data) {
      dispatch (changePlayingState (data));
    },
    toggleFullScreenDispatch (data) {
      dispatch (changeFullScreen (data));
    },
    togglePlayListDispatch (data) {
      dispatch (changeShowPlayList (data));
    },
    changeCurrentIndexDispatch (index) {
      dispatch (changeCurrentIndex (index));
    },
    changeCurrentDispatch (data) {
      dispatch (changeCurrentSong (data));
    },
    changeModeDispatch (data) {
      dispatch (changePlayMode (data));
    },
    changePlayListDispatch (data) {
      dispatch (changePlayList (data));
    }
  };
};

// 将 ui 组件包装成容器组件
export default connect (
  mapStateToProps,
  mapDispatchToProps
)(memo(Player));