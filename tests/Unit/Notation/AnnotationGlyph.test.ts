import {assertEquals} from "@std/assert";
import {AnnotationGlyph} from "../../../src/Notation/AnnotationGlyph.ts";
import {assertThrows} from "@std/assert";

Deno.test('it serializes glyphs', () => {

    assertEquals(new AnnotationGlyph(0).serialize(), '', 'handles null annotation');
    assertEquals(new AnnotationGlyph(1).serialize(), '!', 'handles "!" annotation');
    assertEquals(new AnnotationGlyph(2).serialize(), '?', 'handles "?" annotation');
    assertEquals(new AnnotationGlyph(3).serialize(), '!!', 'handles "!!" annotation');
    assertEquals(new AnnotationGlyph(4).serialize(), '??', 'handles "??" annotation');
    assertEquals(new AnnotationGlyph(5).serialize(), '!?', 'handles "!?" annotation');
    assertEquals(new AnnotationGlyph(6).serialize(), '?!', 'handles "?!" annotation');
    assertEquals(new AnnotationGlyph(7).serialize(), ' $7', 'handles "$7" annotation');
    assertEquals(new AnnotationGlyph(255).serialize(), ' $255', 'handles "$255" annotation');
})

Deno.test('it parses glyphs from string input', () => {
    assertEquals(AnnotationGlyph.fromString(''), new AnnotationGlyph(0), 'handles empty string')
    assertEquals(AnnotationGlyph.fromString('!'), new AnnotationGlyph(1), 'handles "!" string')
    assertEquals(AnnotationGlyph.fromString('?'), new AnnotationGlyph(2), 'handles "?" string')
    assertEquals(AnnotationGlyph.fromString('!!'), new AnnotationGlyph(3), 'handles "!!" string')
    assertEquals(AnnotationGlyph.fromString('??'), new AnnotationGlyph(4), 'handles "??" string')
    assertEquals(AnnotationGlyph.fromString('!?'), new AnnotationGlyph(5), 'handles "!?" string')
    assertEquals(AnnotationGlyph.fromString('?!'), new AnnotationGlyph(6), 'handles "?!" string')
    assertEquals(AnnotationGlyph.fromString('$255'), new AnnotationGlyph(255), 'handles "$255" string')

    assertThrows(() => {AnnotationGlyph.fromString('jsdklf')}, 'throws on gibberish')
    assertThrows(() => {AnnotationGlyph.fromString('$54h')}, 'throws on unparsable numeric value')
    assertThrows(() => {AnnotationGlyph.fromString('$-99')}, 'throws on numeric value out of range')
    assertThrows(() => {AnnotationGlyph.fromString('$600')}, 'throws on numeric value out of range')
})