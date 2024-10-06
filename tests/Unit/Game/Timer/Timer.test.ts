import {describe, it} from "@std/testing/bdd"
import {FakeTime} from "@std/testing/time"
import {assertEquals,assertThrows} from "@std/assert"
import {spy, assertSpyCalls} from "@std/testing/mock"
import {Timer} from "../../../../src/Game/Timer/Timer.ts";


describe("Timer", () => {

    it("constructs itself", () => {
        const timer = new Timer(600)
        assertEquals(timer.timeRemaining,600)
        assertEquals(timer.timeLimit,600)
        assertEquals(timer.turnStartTimeRemaining,600)
    })

    it("calculates time remaining", () => {
        using clock = new FakeTime
        const timer = new Timer(600)
        timer.start()
        clock.tick(1000)
        assertEquals(timer.timeRemaining, 599)
    })

    it("ticks once per second", () => {
        using clock = new FakeTime
        const timer = new Timer(600)
        timer.start()
        clock.tick(3000)
        assertEquals(timer.timeRemaining, 597)
        clock.tick(3000)
        assertEquals(timer.timeRemaining, 594)
    })

    it("starts and stops", () => {
        using clock = new FakeTime
        const timer = new Timer(300)
        timer.start()
        clock.tick(5000)
        assertEquals(timer.timeRemaining, 295)
        timer.stop()
        clock.tick(50000)
        assertEquals(timer.timeRemaining, 295)
        timer.start()
        clock.tick(95000)
        assertEquals(timer.timeRemaining, 200)
    })

    it("start() throws if timer is expired", () => {
        using clock = new FakeTime
        const timer = new Timer(60)
        timer.start()
        clock.tick(60000)
        assertThrows(() => {
            timer.start()
        })
    })

    it('tick() throws if timer is stopped', () => {
        const timer = new Timer(60)
        assertThrows(() => {
            timer.tick()
        })
    })

    it("stops when time is expired", () => {
        using clock = new FakeTime
        const timer = new Timer(60)
        const cb = spy()
        timer.setTimeoutCallback(cb)
        timer.start()
        clock.tick(60000)
        assertEquals(timer.timeRemaining, 0)
        assertEquals(timer.intervalId, null)
        clock.tick(5000)
        assertEquals(timer.timeRemaining, 0)
        assertEquals(timer.intervalId, null)
        assertSpyCalls(cb,1) // callback method called when time expires
    })

})