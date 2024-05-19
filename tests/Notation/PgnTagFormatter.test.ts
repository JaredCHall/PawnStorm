import {PgnTagFormatter} from "../../src/Notation/PgnTagFormatter.ts";
import {GameStatus} from "../../src/Game/GameStatus.ts";
import { assertEquals } from "https://deno.land/std@0.219.0/assert/assert_equals.ts";

Deno.test('it formats result tag', () => {
    let status

    status = new GameStatus('normal', 'white', null)
    assertEquals(PgnTagFormatter.formatResult(status),'1-0')

    status = new GameStatus('normal', 'black', null)
    assertEquals(PgnTagFormatter.formatResult(status),'0-1')

    status = new GameStatus('normal', null, null)
    assertEquals(PgnTagFormatter.formatResult(status),'1/2-1/2')

    status = new GameStatus('unterminated', null, null)
    assertEquals(PgnTagFormatter.formatResult(status),'*')
})

Deno.test('it formats date tag', () => {
    assertEquals(PgnTagFormatter.formatDate(new Date('2024-01-04')),'2024.01.04')
})