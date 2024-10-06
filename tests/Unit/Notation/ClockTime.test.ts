import {describe, it} from "@std/testing/bdd"
import {assertEquals,assertThrows} from "@std/assert"
import {ClockTime} from "../../../src/Notation/ClockTime.ts";

describe("ClockTime", () => {

    it('constructs itself', () => {
        const time = new ClockTime(60)
        assertEquals(time.seconds, 60)
    })


    const cases = [
        [600, "00:10:00"],
        [3666, "01:01:06"],
        [7, "00:00:07"],
        [0, "00:00:00"],
        [3599, "00:59:59"],
        [86400,"24:00:00"],
        [7325, "02:02:05"],
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