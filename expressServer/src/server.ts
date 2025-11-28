import {json} from 'body-parser'
import express, {Request, Response} from 'express'

import {deviceState, mqttClient} from './mqttClient'
import {errorHandler} from './utils/errorHandler'
import {generateAccessToken, generateRefreshToken, verifyToken} from './utils/jwt'
import logger from './utils/logger'

const app = express()
const PORT = process.env.PORT || 3535
const user_id = '353535'

app.use(json())

app.get('/', (req: Request, res: Response) => {
	logger.debug('Root endpoint triggered')
	res.send('Express TypeScript server with Winston is running!')
})

//============================= YANDEX DIALOGS =============================
app.head('/v1.0', (req: Request, res: Response) => res.sendStatus(200))
app.post('/v1.0/token', express.urlencoded({extended: true}), async (req: Request, res: Response) => {
	logger.debug('YANDEX SMART HOME POST /v1.0/token')
	const {grant_type, code, refresh_token} = req.body
	if (grant_type === 'authorization_code') {
		if (!code) {
			return res.status(400).json({
				error: 'invalid_request',
				error_description: 'Missing "code"'
			})
		}
		//todo
		// - смотришь code в БД
		// - проверяешь user_id
		// - удаляешь code
		const access = generateAccessToken({user_id})
		const refresh = generateRefreshToken({user_id})
		return res.json({
			access_token: access,
			token_type: 'bearer',
			expires_in: 30 * 12 * 60 * 60,
			refresh_token: refresh
		})
	}
	if (grant_type === 'refresh_token') {
		if (!refresh_token) {
			return res.status(400).json({
				error: 'invalid_request',
				error_description: 'Missing "refresh_token"'
			})
		}
		try {
			const decoded: any = verifyToken(refresh_token)
			const newAccess = generateAccessToken({user_id: decoded.user_id})
			const newRefresh = generateRefreshToken({user_id: decoded.user_id})
			return res.json({
				access_token: newAccess,
				token_type: 'bearer',
				expires_in: 30 * 12 * 60 * 60,
				refresh_token: newRefresh
			})
		} catch (e) {
			return res.status(400).json({
				error: 'invalid_grant',
				error_description: 'Invalid refresh token'
			})
		}
	}
	return res.status(400).json({
		error: 'unsupported_grant_type',
		error_description: 'Only authorization_code or refresh_token supported'
	})
})
app.post('/v1.0/auth', (req: Request, res: Response) => {
	logger.debug('YANDEX SMART HOME POST /v1.0/auth')
	const authHeader = req.headers['authorization']
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({
			error: 'INVALID_TOKEN',
			error_message: 'Missing Authorization header'
		})
	}
	const token = authHeader.replace('Bearer ', '')
	try {
		const decoded: any = verifyToken(token)
		return res.json({
			user_id: decoded.user_id
		})
	} catch (e) {
		return res.status(401).json({
			error: 'INVALID_TOKEN',
			error_message: 'Token verification failed'
		})
	}
})
app.get('/v1.0/user/devices', (req: Request, res: Response) => {
	logger.debug('YANDEX DIALOGS GET /v1.0/user/devices')
	const devices = [
		{
			id: 'lamp-1',
			name: 'Лампа у окна',
			description: 'Лампа над окном в детской комнате',
			room: 'Детская',
			type: 'devices.types.light',
			device_info: {
				manufacturer: 'MySmartHome',
				model: 'ESP32-Lamp-1',
				hw_version: '1.0',
				sw_version: '1.2.3'
			},
			capabilities: [
				{
					type: 'devices.capabilities.on_off',
					retrievable: true
				}
			],
			properties: []
		}
	]
	devices.map(device => {
		if (!deviceState[device.id]) {
			deviceState[device.id] = device
		}
	})
	return res.json({
		request_id: req.headers['x-request-id'] ?? '',
		payload: {
			user_id,
			devices
		}
	})
})
app.post('/v1.0/user/devices/query', (req: Request, res: Response) => {
	logger.debug('YANDEX DIALOGS POST /v1.0/user/devices/query')
	const devices = Array.isArray(req.body?.devices) ? req.body.devices : []
	const result = devices.map((device: any) => {
		const id = device.id
		const stored = deviceState[id]
		if (!stored) {
			return {
				id,
				error_code: 'DEVICE_NOT_FOUND',
				error_message: 'Нет состояния, ESP не отправлял данные'
			}
		}
		return {
			id,
			capabilities: [
				{
					type: 'devices.capabilities.on_off',
					state: {
						instance: 'on',
						value: stored.on
					}
				}
			],
			properties: []
		}
	})
	return res.json({
		request_id: req.headers['x-request-id'] || '',
		payload: {
			devices: result
		}
	})
})
app.post('/v1.0/user/devices/action', (req: Request, res: Response) => {
	logger.debug('YANDEX DIALOGS POST /v1.0/user/devices/action')
	const devices = Array.isArray(req.body?.payload?.devices) ? req.body.payload.devices : []
	const results = devices.map((device: any) => {
		const id = device.id
		const resultCaps = device.capabilities.map((cap: any) => {
			const {type, state} = cap
			// ON/OFF
			if (type === 'devices.capabilities.on_off') {
				const cmd = {on: state.value}
				mqttClient.publish(`state/${id}`, JSON.stringify(cmd))
				return {
					type,
					state: {
						instance: 'on',
						action_result: {status: 'DONE'}
					}
				}
			}
			return {
				type,
				state: {
					instance: state.instance,
					action_result: {
						status: 'ERROR',
						error_code: 'INVALID_ACTION',
						error_message: 'Unknown action'
					}
				}
			}
		})
		return {
			id,
			capabilities: resultCaps
		}
	})
	return res.json({
		request_id: req.headers['x-request-id'] || '',
		payload: {devices: results}
	})
})
app.post('/v1.0/user/unlink', (req: Request, res: Response) => {
	logger.warn('YANDEX DIALOGS POST /v1.0/user/unlink — user revoked access')
	return res.json({})
})

app.use(errorHandler)
app.listen(PORT, () => {
	logger.info(`Server started on http://localhost:${PORT}`)
})
