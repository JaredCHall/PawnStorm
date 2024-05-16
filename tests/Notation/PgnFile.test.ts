import { assertEquals } from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {GameStatus} from "../../src/Game/GameStatus.ts";
import {PgnFile} from "../../src/Notation/PgnFile.ts";

Deno.test('it formats result tag', () => {
    let status

    status = new GameStatus('normal', 'white', null)
    assertEquals(PgnFile.formatResultTag(status),'1-0')

    status = new GameStatus('normal', 'black', null)
    assertEquals(PgnFile.formatResultTag(status),'0-1')

    status = new GameStatus('normal', null, null)
    assertEquals(PgnFile.formatResultTag(status),'1/2-1/2')

    status = new GameStatus('unterminated', null, null)
    assertEquals(PgnFile.formatResultTag(status),'*')
})

Deno.test('it formats date tag', () => {
    assertEquals(PgnFile.formatDateTag(new Date('2024-01-04')),'2024.01.04')
})