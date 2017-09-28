import React from 'react';

const CONTROL_BAR_HEIGHT = 35;

export const Subs = ({
    chunk_text_nodes,
    current_word,
    failed_word_rectangles,
    marked_word,
    sending_subs,
    sent_word_rectangles,
    set_selection,
    set_subs_el,
    subs_chunks,
    subs_offset,
}) => (
    <div className='subs'>
        <p
            ref={set_subs_el}
            onMouseUp={set_selection}
        >{
            subs_chunks.map((chunk, i) => <span
                key={'chunk-' + i}
                data-char_offset={chunk.char_offset}
                data-chunk_index={i}
                className={chunk.is_humanic ? 'is-humanic' : 'is-automatic'}
                ref={(el) => {
                    chunk_text_nodes[i] = el ? el.childNodes[0] : null;
                }}
            >{chunk.str}</span>)
        }</p>
        <div className='sub-rects'>
            {marked_word
                ? <span
                    className='marked-word-rect'
                    style={{
                        top:    marked_word.rect.top    - subs_offset.top + window.scrollY,
                        left:   marked_word.rect.left   - subs_offset.left,
                        width:  marked_word.rect.right  - marked_word.rect.left,
                        height: marked_word.rect.bottom - marked_word.rect.top,
                    }}
                />
                : null
            }
            {current_word.rects.map((rect, i) => {
                if (    rect.bottom + CONTROL_BAR_HEIGHT > window.innerHeight
                    ||  rect.top < 0
                ) {
                    window.scrollTo(
                        window.scrollX,
                        window.scrollY + rect.top,
                    );
                }
                return <span
                    key={'sub-rect-' + i}
                    className='sub-rect'
                    style={{
                        top:    rect.top    - subs_offset.top + window.scrollY,
                        left:   rect.left   - subs_offset.left,
                        width:  rect.right  - rect.left,
                        height: rect.bottom - rect.top,
                    }}
                />;
            })}
            {sending_subs && sent_word_rectangles
                ? sent_word_rectangles.map((rect, i) => (
                    <span
                        key={'submitted-word-rect-' + i}
                        className='submitted-word-rect'
                        style={{
                            top:    rect.top    - subs_offset.top + window.scrollY,
                            left:   rect.left   - subs_offset.left,
                            width:  rect.right  - rect.left,
                            height: rect.bottom - rect.top,
                        }}
                    />
                ))
                : null
            }
            {failed_word_rectangles.map((rect, i) => (
                <span
                    key={'failed-word-rect-' + i}
                    className='failed-word-rect'
                    style={{
                        top:    rect.top    - subs_offset.top + window.scrollY,
                        left:   rect.left   - subs_offset.left,
                        width:  rect.right  - rect.left,
                        height: rect.bottom - rect.top,
                    }}
                />
            )) }
        </div>
    </div>
);
