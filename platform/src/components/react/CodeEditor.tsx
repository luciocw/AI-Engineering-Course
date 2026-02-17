import { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { highlightSelectionMatches } from '@codemirror/search';

type Props = {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  height?: string;
};

const customTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    backgroundColor: '#0d1117',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', monospace",
    padding: '12px 0',
  },
  '.cm-gutters': {
    backgroundColor: '#0d1117',
    borderRight: '1px solid #2a3040',
    color: '#64748b',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1a1f2e',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(26, 31, 46, 0.5)',
  },
  '.cm-cursor': {
    borderLeftColor: '#06b6d4',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(6, 182, 212, 0.2) !important',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
});

export default function CodeEditor({ code, onChange, readOnly = false, height = '400px' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      javascript({ typescript: true }),
      oneDark,
      customTheme,
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      bracketMatching(),
      closeBrackets(),
      indentOnInput(),
      foldGutter(),
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, indentWithTab]),
      EditorView.lineWrapping,
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    if (onChange) {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        })
      );
    }

    const state = EditorState.create({
      doc: code,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only create editor once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update code when it changes externally (e.g., reset)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentCode = view.state.doc.toString();
    if (currentCode !== code) {
      view.dispatch({
        changes: { from: 0, to: currentCode.length, insert: code },
      });
    }
  }, [code]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-[var(--color-border)] overflow-hidden"
      style={{ height, maxHeight: height }}
    />
  );
}
