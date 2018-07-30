import moment from 'moment'

export function formatTime (str) {
  return moment(str).format('YYYY/MM/DD HH:mm:ss')
}
