import React, { memo, useEffect } from 'react';
import { connect } from "react-redux";
import { forceCheck } from 'react-lazyload';
import * as actionTypes from './store/actionCreators';
import Slider from '../../components/slider';
import Loading from '../../baseUI/loading/index';
import RecommendList from '../../components/list';
import Scroll from '../../baseUI/scroll';
import { Content } from './style';

function Recommend (props) {
    const { bannerList, recommendList, enterLoading } = props;
    const { getBannerDataDispatch, getRecommendListDataDispatch } = props;

    useEffect (() => {
      // 如果页面有数据，则不发请求
      //immutable 数据结构中长度属性 size
      if (!bannerList.size){
        getBannerDataDispatch ();
      }
      if (!recommendList.size){
        getRecommendListDataDispatch ();
      }
      //eslint-disable-next-line
    }, []);

    const bannerListJS = bannerList ? bannerList.toJS () : [];
    const recommendListJS = recommendList ? recommendList.toJS () :[];

    // //mock 数据
    // const bannerList = [1,2,3,4].map (item => {
    //     return { imageUrl: "http://p1.music.126.net/ZYLJ2oZn74yUz5x8NBGkVA==/109951164331219056.jpg" }
    // });

    // const recommendList = [1,2,3,4,5,6,7,8,9,10].map ((item, index) => {
    //     return {
    //       id: 1 + index,
    //       picUrl: "https://p1.music.126.net/fhmefjUfMD-8qtj3JKeHbA==/18999560928537533.jpg",
    //       playCount: 17171122,
    //       name: "朴树、许巍、李健、郑钧、老狼、赵雷"
    //     }
    // });

    return (
        <Content>
          <Scroll onScroll={forceCheck}>
              <div>
                  <Slider bannerList={bannerListJS}></Slider>
                  <RecommendList recommendList={recommendListJS}></RecommendList>
              </div>
          </Scroll>
          { enterLoading ? <Loading></Loading> : null }
        </Content> 
    )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
    // 不要在这里将数据 toJS
    // 不然每次 diff 比对 props 的时候都是不一样的引用，还是导致不必要的重渲染，属于滥用 immutable
    bannerList: state.getIn (['recommend', 'bannerList']),
    recommendList: state.getIn (['recommend', 'recommendList']),
    enterLoading: state.getIn (['recommend', 'enterLoading'])
  });
  // 映射 dispatch 到 props 上
  const mapDispatchToProps = (dispatch) => {
    return {
        getBannerDataDispatch () {
          dispatch (actionTypes.getBannerList ());
        },
        getRecommendListDataDispatch () {
          dispatch (actionTypes.getRecommendList ());
        },
      }
  };

export default connect (mapStateToProps, mapDispatchToProps)(memo(Recommend));


