import { axiosInstance } from "./axios";

// Recommend
export const getBannerRequest = () => {
  return axiosInstance.get ('/banner');
}

export const getRecommendListRequest = () => {
  return axiosInstance.get ('/personalized');
}

// Singer 
export const getHotSingerListRequest = (count) => {
  return axiosInstance.get(`/top/artists?offset=${count}`);
}

export const getSingerListRequest= (category, alpha, count) => {
  return axiosInstance.get(`/artist/list?cat=${category}&initial=${alpha.toLowerCase()}&offset=${count}`);
}

// rank
export const getRankListRequest = () => {
  return axiosInstance.get (`/toplist/detail`);
};

// Album
export const getAlbumDetailRequest = id => {
  return axiosInstance.get (`/playlist/detail?id=${id}`);
};

// Singer
export const getSingerInfoRequest = id => {
  return axiosInstance.get (`/artists?id=${id}`);
};

// 歌词
export const getLyricRequest = id => {
  return axiosInstance.get (`/lyric?id=${id}`);
};

export const getHotKeyWordsRequest = () => {
  return axiosInstance.get (`/search/hot`);
};

export const getSuggestListRequest = query => {
  return axiosInstance.get (`/search/suggest?keywords=${query}`);
};

export const getResultSongsListRequest = query => {
  return axiosInstance.get (`/search?keywords=${query}`);
};

export const getSongDetailRequest = id => {
  return axiosInstance.get (`/song/detail?ids=${id}`);
};