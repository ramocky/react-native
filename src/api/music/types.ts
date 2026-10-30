export type TrackSource = 'audius' | 'itunes';

export interface Track {
  /** 源站内的唯一标识 */
  id: string;
  title: string;
  artist: string;
  /** 封面图 URL，可能为空串 */
  artwork: string;
  /** 时长，秒 */
  duration: number;
  /** 可直接交给播放器的音频地址 */
  streamUrl: string;
  source: TrackSource;
}

/**
 * 音乐源统一接口。换源只需新增一个实现并在 providers 中注册，
 * 页面层不感知具体服务商。
 */
export interface MusicProvider {
  id: TrackSource;
  label: string;
  /** 推荐/热门；无此概念的源可用固定关键词兜底 */
  trending(limit?: number, offset?: number): Promise<Track[]>;
  search(query: string, limit?: number, offset?: number): Promise<Track[]>;
}
