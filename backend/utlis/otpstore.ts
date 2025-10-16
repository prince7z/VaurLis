interface OTP{
  otp:String,
  expiresAt: Date,
  attempts: number,

}

export type res = "NOT_FOUND" | "EXPIRED" | "EXCEEDED_ATTEMPTS" | "INVALID_OTP" | "VALID" | "ERROR";
const otpStore = new Map<string, OTP>();

export const genotp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export const storeOtp = (email: string, otp: string) => {
    otpStore.set(email, { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 });
}
export const verifyOtp = (email: string, otp: string): res => {

    const record = otpStore.get(email);
    if (!record) return "NOT_FOUND";

    if (record.expiresAt < new Date()) {
        otpStore.delete(email);
        return "EXPIRED";
    }

    if (record.attempts >= 3) {
        otpStore.delete(email);
        return "EXCEEDED_ATTEMPTS";
    }

    if (record.otp !== otp) {
        record.attempts += 1;
        return "INVALID_OTP";
    }
    if (record.otp === otp || otp.toString() === record.otp) {
        otpStore.delete(email);
        return "VALID";
    }

    return "ERROR";
}
