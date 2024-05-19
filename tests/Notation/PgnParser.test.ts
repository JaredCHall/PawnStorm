import { assertEquals } from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {GameStatus} from "../../src/Game/GameStatus.ts";
import {PgnParser} from "../../src/Notation/PgnParser.ts";

Deno.test('it formats result tag', () => {
    let status

    status = new GameStatus('normal', 'white', null)
    assertEquals(PgnParser.formatResultTag(status),'1-0')

    status = new GameStatus('normal', 'black', null)
    assertEquals(PgnParser.formatResultTag(status),'0-1')

    status = new GameStatus('normal', null, null)
    assertEquals(PgnParser.formatResultTag(status),'1/2-1/2')

    status = new GameStatus('unterminated', null, null)
    assertEquals(PgnParser.formatResultTag(status),'*')
})

Deno.test('it formats date tag', () => {
    assertEquals(PgnParser.formatDateTag(new Date('2024-01-04')),'2024.01.04')
})