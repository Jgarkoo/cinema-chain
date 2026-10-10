export interface Notify {
  movieId: string
  subscribed: boolean
}

export interface notifyResponse {
  data: Notify[];
}

export interface notifyError {
  message: string;
}
