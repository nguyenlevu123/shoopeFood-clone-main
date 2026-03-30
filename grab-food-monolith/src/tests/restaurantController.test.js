import assert from 'assert'
import { describe, it } from 'node:test'
import { verifyCoordinates, verifyTimes } from '../controllers/restaurantController.js'

describe('Restaurant Controller validation', () => {
  it('should accept valid coordinates', () => {
    assert.strictEqual(verifyCoordinates(10.0, 20.0), null)
  })

  it('should reject invalid latitude', () => {
    assert.strictEqual(verifyCoordinates(-91, 0), 'latitude must be between -90 and 90')
  })

  it('should reject invalid longitude', () => {
    assert.strictEqual(verifyCoordinates(0, 181), 'longitude must be between -180 and 180')
  })

  it('should accept valid time range', () => {
    assert.strictEqual(verifyTimes('08:00', '18:00'), null)
  })

  it('should reject closing before opening', () => {
    assert.strictEqual(verifyTimes('18:00', '08:00'), 'opening_time must be earlier than closing_time')
  })
})
