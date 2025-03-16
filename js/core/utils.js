function formatBytes(bytes, decimals = 2) {
    if(!+bytes) return "0 Bytes"
  
    const k = 1024
    const dm = decimals
    const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB"]
  
    const i = Math.floor(Math.log(bytes)/ Math.log(k))
    return `${parseFloat((bytes/Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }
function bytesToMB(bytes) {
    return bytes / 1024 / 1024;
}


module.exports = { formatBytes, bytesToMB };