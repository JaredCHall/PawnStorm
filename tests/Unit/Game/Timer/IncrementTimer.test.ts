import {describe, it} from "@std/testing/bdd"
import {FakeTime} from "@std/testing/time"
import {assertEquals} from "@std/assert"
import {spy, assertSpyCalls} from "@std/testing/mock"
import {IncrementTimer} from "../../../../src/Game/Timer/IncrementTimer.ts";


describe('IncrementTimer', () => {


    it('constructs itself', () => {
        const timer = new IncrementTimer(600, 5)
        assertEquals(timer.timeRemaining,600)
        assertEquals(timer.timeLimit,600)
        assertEquals(timer.turnStartTimeRemaining,600)
        assertEquals(timer.increment, 5)
    })

    it('adds increment time when timer is stopped', () => {
        using clock = new FakeTime
        const timer = new IncrementTimer(600, 5)
        timer.start()
        timer.stop()
        assertEquals(timer.timeRemaining, 605)
        clock.tick(1000)
        timer.start()
        clock.tick(2000)
        timer.stop()
        assertEquals(timer.timeRemaining, 608)
    })


    it('increment time does not regress timeout behavior', () => {
        using clock = new FakeTime
        const timer = new IncrementTimer(60, 5)
        const cb = spy()
        timer.setTimeoutCallback(cb)
        timer.start()
        clock.tick(60000)
        assertEquals(timer.timeRemaining, 0)
        assertEquals(timer.intervalId, null)
        timer.stop()

        assertSpyCalls(cb,1) // callback method called when time expires
    })

})