export const getCurrentDateTime = () => {
    const date = new Date();

    // 补零函数：确保数字为两位数（例如 1 → "01"）
    const padZero = (num) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1); // 月份从 0 开始
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}