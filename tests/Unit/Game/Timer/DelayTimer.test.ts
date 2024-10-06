import {describe, it} from "@std/testing/bdd"
import {FakeTime} from "@std/testing/time"
import {assertEquals} from "@std/assert"
import {spy, assertSpyCalls} from "@std/testing/mock"
import {DelayTimer} from "../../../../src/Game/Timer/DelayTimer.ts";

describe('DelayTimer', () => {


    it('constructs itself', () => {
        const timer = new DelayTimer(600, 5)
        assertEquals(timer.timeRemaining,600)
        assertEquals(timer.timeLimit,600)
        assertEquals(timer.turnStartTimeRemaining,600)
        assertEquals(timer.delay, 5)
    })

    it('calculates time remaining within delay time', () => {
        using clock = new FakeTime
        const timer = new DelayTimer(600, 5)
        timer.start()
        clock.tick(4000)
        assertEquals(timer.timeRemaining, 600)
        clock.tick(1000)
        assertEquals(timer.timeRemaining, 600)
    })


    it('calculates time remaining beyond delay time', () => {
        using clock = new FakeTime
        const timer = new DelayTimer(60, 5)
        timer.start()
        clock.tick(6000)
        assertEquals(timer.timeRemaining, 59)
    })

    it('does not timeout during delay time', () => {
        using clock = new FakeTime
        const timer = new DelayTimer(60, 5)
        const cb = spy()
        timer.setTimeoutCallback(cb)
        timer.start()
        clock.tick(60000)
        assertEquals(timer.timeRemaining, 5)
        assertSpyCalls(cb,0) // callback method called when time expires
        timer.stop()
        timer.start()
        clock.tick(9000)
        assertEquals(timer.timeRemaining, 1)
        clock.tick(1000)
        assertEquals(timer.timeRemaining, 0)
        assertEquals(timer.intervalId, null)
        timer.stop()
        assertEquals(timer.timeRemaining, 0)
        assertSpyCalls(cb,1) // callback method called when time expires
    })

})