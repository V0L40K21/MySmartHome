import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const ACCESS_TOKEN_EXPIRES = '12h'
const REFRESH_TOKEN_EXPIRES = '30d'

export function generateAccessToken(payload: any) {
	return jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRES})
}

export function generateRefreshToken(payload: any) {
	return jwt.sign(payload, JWT_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRES})
}

export function verifyToken(token: string) {
	return jwt.verify(token, JWT_SECRET)
}
