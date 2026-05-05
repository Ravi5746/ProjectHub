// 6-digit OTP — same as server/utils/genratedotp.js
const generateOtp = () => {
    return Math.floor(Math.random() * 900000) + 100000
}

export default generateOtp
