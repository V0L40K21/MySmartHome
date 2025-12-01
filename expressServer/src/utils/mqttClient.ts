import mqtt from 'mqtt'

import logger from './logger'

export const deviceState: Record<string, any> = {}

const MQTT_URL = process.env.MQTT_URL

if (!MQTT_URL) {
	logger.error('MQTT_URL не задан!')
}

export const mqttClient = mqtt.connect(MQTT_URL ?? '', {
	clean: true,
	reconnectPeriod: 2000,
	keepalive: 30,
	connectTimeout: 10_000
})

mqttClient.on('connect', () => {
	logger.info('MQTT подключен к EMQX Cloud')

	mqttClient.subscribe('state/#', {qos: 1}, err => {
		if (err) logger.error('Ошибка подписки: ' + err.message)
		else logger.info('Подписан на topic state/#')
	})
})

mqttClient.on('reconnect', () => logger.warn('MQTT reconnect…'))
mqttClient.on('close', () => logger.warn('MQTT соединение закрыто'))
mqttClient.on('offline', () => logger.warn('MQTT offline'))
mqttClient.on('error', err => logger.error('MQTT ошибка: ' + err.message))

mqttClient.on('message', (topic, buffer) => {
	try {
		const message = buffer.toString()
		const json = JSON.parse(message)
		const [, deviceId] = topic.split('/')

		logger.debug(`MQTT state ${deviceId}: ${message}`)

		deviceState[deviceId] = {
			...deviceState[deviceId],
			...json,
			updatedAt: Date.now()
		}
	} catch (e: any) {
		logger.error('JSON error: ' + e.message)
	}
})
