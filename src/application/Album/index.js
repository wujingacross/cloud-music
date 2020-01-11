import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import  Header  from './../../baseUI/header/index';
import Scroll from '../../baseUI/scroll/index';
import Loading from '../../baseUI/loading/index';
import {Container, TopDesc, Menu} from './style';
import { getName, getCount, isEmptyObject } from './../../api/utils';
import style from "../../assets/global-style";
import { getAlbumList, changeEnterLoading } from './store/actionCreators';
import MusicNote from "../../baseUI/music-note/index";
import SongsList from '../SongsList';

export const HEADER_HEIGHT = 45;

function Album (props) {
  // 从路由中拿到歌单的 id
  const id = props.match.params.id;
  const { currentAlbum:currentAlbumImmutable, enterLoading, songsCount } = props;
  const { getAlbumDataDispatch } = props;
  const [showStatus, setShowStatus] = useState(true);
  const [title, setTitle] = useState ("歌单");
  const [isMarquee, setIsMarquee] = useState (false);// 是否跑马灯
  const headerEl = useRef ();
  const musicNoteRef = useRef();

  let currentAlbum = currentAlbumImmutable.toJS ();

  useEffect (() => {
    getAlbumDataDispatch (id);
  }, [getAlbumDataDispatch, id]);

  const handleScroll = useCallback((pos) => {
    let minScrollY = -HEADER_HEIGHT;
    let percent = Math.abs (pos.y/minScrollY);
    let headerDom = headerEl.current;
    // 滑过顶部的高度开始变化
    if (pos.y < minScrollY) {
      headerDom.style.backgroundColor = style["theme-color"];
      headerDom.style.opacity = Math.min (1, (percent-1)/2);
      setTitle (currentAlbum.name);
      setIsMarquee (true);
    } else {
      headerDom.style.backgroundColor = "";
      headerDom.style.opacity = 1;
      setTitle ("歌单");
      setIsMarquee (false);
    }
  }, [currentAlbum]);

  // //mock 数据
  // const currentAlbum = {
  //   creator: {
  //     avatarUrl: "http://p1.music.126.net/O9zV6jeawR43pfiK2JaVSw==/109951164232128905.jpg",
  //     nickname: "浪里推舟"
  //   },
  //   coverImgUrl: "http://p2.music.126.net/ecpXnH13-0QWpWQmqlR0gw==/109951164354856816.jpg",
  //   subscribedCount: 2010711,
  //   name: "听完就睡，耳机是天黑以后柔软的梦境",
  //   tracks:[
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //     {
  //       name: "我真的受伤了",
  //       ar: [{name: "张学友"}, {name: "周华健"}],
  //       al: {
  //         name: "学友 热"
  //       }
  //     },
  //   ]
  // }

  const handleBack = useCallback(() => {
    setShowStatus (false);
  }, []);

  const musicAnimation = (x, y) => {
    musicNoteRef.current.startAnimation({ x, y });
  };

  const renderTopDesc = () => (
    <TopDesc background={currentAlbum.coverImgUrl}>
      <div className="background">
        <div className="filter"></div>
      </div>
      <div className="img_wrapper">
        <div className="decorate"></div>
        <img src={currentAlbum.coverImgUrl} alt=""/>
        <div className="play_count">
          <i className="iconfont play">&#xe885;</i>
          <span className="count">{Math.floor (currentAlbum.subscribedCount/1000)/10} 万 </span>
        </div>
      </div>
      <div className="desc_wrapper">
        <div className="title">{currentAlbum.name}</div>
        <div className="person">
          <div className="avatar">
            <img src={currentAlbum.creator.avatarUrl} alt=""/>
          </div>
          <div className="name">{currentAlbum.creator.nickname}</div>
        </div>
      </div>
    </TopDesc>
  )

    const renderMenu = () => (
      <Menu>
        <div>
          <i className="iconfont">&#xe6ad;</i>
          评论
        </div>
        <div>
          <i className="iconfont">&#xe86f;</i>
          点赞
        </div>
        <div>
          <i className="iconfont">&#xe62d;</i>
          收藏
        </div>
        <div>
          <i className="iconfont">&#xe606;</i>
          更多
        </div>
      </Menu>
    );

  return (
    <CSSTransition
      in={showStatus}  
      timeout={300} 
      classNames="fly" 
      appear={true} 
      unmountOnExit
      onExited={props.history.goBack}
    >
      <Container play={songsCount}>
        <Header ref={headerEl} title={"返回"} handleClick={handleBack} isMarquee={isMarquee}></Header>
        {!isEmptyObject (currentAlbum) ? (
          <Scroll bounceTop={false} onScroll={handleScroll}>
          <div>
            { renderTopDesc () }
            { renderMenu () }
            <SongsList
              songs={currentAlbum.tracks}
              collectCount={currentAlbum.subscribedCount}
              showCollect={true}
              showBackground={true}
              musicAnimation={musicAnimation}
            ></SongsList>
          </div>  
        </Scroll>
        ) : null}
        <Loading show={enterLoading}></Loading>
        <MusicNote ref={musicNoteRef}></MusicNote>
      </Container>
    </CSSTransition>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  currentAlbum: state.getIn (['album', 'currentAlbum']),
  enterLoading: state.getIn (['album', 'enterLoading']),
  songsCount: state.getIn (['player', 'playList']).size
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    getAlbumDataDispatch (id) {
      dispatch(changeEnterLoading(true));
      dispatch(getAlbumList(id));
    },
  }
};

// 将 ui 组件包装成容器组件
export default connect (mapStateToProps, mapDispatchToProps)(memo(Album));