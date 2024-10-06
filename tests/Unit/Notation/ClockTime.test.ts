import {describe, it} from "@std/testing/bdd"
import {assertEquals,assertThrows} from "@std/assert"
import {ClockTime} from "../../../src/Notation/ClockTime.ts";

describe("ClockTime", () => {

    it('constructs itself', () => {
        const time = new ClockTime(60)
        assertEquals(time.seconds, 60)
    })

    it('throws if time limit greater than 9:59:59', () => {
        assertThrows(() => {
            new ClockTime(86400)
        })
    })

    it('throws if time limit < 0', () => {
        assertThrows(() => {
            new ClockTime(-1)
        })
    })


    const cases = [
        [600, "0:10:00"],
        [3666, "1:01:06"],
        [7, "0:00:07"],
        [0, "0:00:00"],
        [3599, "0:59:59"],
        [7325, "2:02:05"],
    ]

    cases.forEach((args) => {
        it(`gets time string ${args[1]}`,() => {
            assertEquals(
                // @ts-ignore -
                new ClockTime(args[0]).getTimeString(),
                args[1]
            )
        })
    })
})