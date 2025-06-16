import { useEditor, EditorContent } from '@tiptap/react'
import TiptapToolbar from './TiptapToolbar'
import LinkInputTooltip from './LinkInputTooltip'

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useRef, useEffect } from 'react'
import Turndown from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import TextAlign from '@tiptap/extension-text-align'
import LinkExtension from '@tiptap/extension-link'

import UnderlineExtension from '@tiptap/extension-underline'

import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'

// Import useAuth from Clerk
import { useAuth } from '@clerk/clerk-react';

function cleanTableParagraphs(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('td > p, th > p').forEach((p) => {
    const parent = p.parentElement;
    if (parent) {
      parent.innerHTML = p.innerHTML;
    }
  });
  div.querySelectorAll('table, tr, td, th').forEach((el) => {
    el.removeAttribute('style');
    el.removeAttribute('colspan');
    el.removeAttribute('rowspan');
    el.removeAttribute('class');
  });
  div.querySelectorAll('colgroup, col').forEach(el => el.remove());
  return div.innerHTML;
}


export default function TiptapEditor() {
  const [htmlOutput, setHtmlOutput] = useState('')
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [outputView, setOutputView] = useState('editor')
  const [notification, setNotification] = useState({ show: false, message: '' })
  const [linkUrl, setLinkUrl] = useState('')
  const [isEditingLink, setIsEditingLink] = useState(false)
  const linkInputRef = useRef(null)

  const { isSignedIn } = useAuth(); // Get auth state from Clerk

  const turndownService = new Turndown({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
  });
  turndownService.use(gfm);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Escribe tu contenido aquí...' }),
      UnderlineExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({ openInNewTab: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      const rawHtml = editor.getHTML();
      const cleanedHtml = cleanTableParagraphs(rawHtml);
      setHtmlOutput(cleanedHtml);
      setMarkdownOutput(turndownService.turndown(cleanedHtml));
      if (!editor.isActive('link')) {
        setIsEditingLink(false);
      }
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        linkInputRef.current &&
        !linkInputRef.current.contains(event.target) &&
        !event.target.closest('.toolbar-button[title*="enlace"]')
      ) {
        setIsEditingLink(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('¡Copiado al portapapeles!');
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setIsEditingLink(true);
    setTimeout(() => {
      if (linkInputRef.current) {
        linkInputRef.current.focus();
      }
    }, 0);
  };

  const applyLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setIsEditingLink(false);
  };

  const unsetLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsEditingLink(false);
  };

  const showEditor = () => setOutputView('editor');
  const showHtml = () => setOutputView('html');
  const showMarkdown = () => setOutputView('markdown');

  const handleSaveDocument = () => {
    if (!editor || !isSignedIn) return; // Also check isSignedIn here for safety, though button shouldn't be visible
    const contentToSave = editor.getHTML(); // Using HTML content
    localStorage.setItem('tiptapUserDocument', contentToSave); // Use a more specific key
    showNotification('¡Documento guardado localmente!');
  };

      const handleLoadDocument = () => {
        if (!editor || !isSignedIn) return;
        const savedContent = localStorage.getItem('tiptapUserDocument');
        if (savedContent) {
          editor.commands.setContent(savedContent);
          showNotification('¡Documento cargado desde el almacenamiento local!');
        } else {
          showNotification('No se encontró ningún documento guardado.');
        }
      };

  if (!editor) return null;

  return (
    <div className="editor-container">
      {notification.show && <div className="notification">{notification.message}</div>}

      {outputView === 'editor' && (
        <>
          <TiptapToolbar editor={editor} setLink={setLink} unsetLink={unsetLink} />
          <LinkInputTooltip
            editor={editor}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            isEditingLink={isEditingLink}
            setIsEditingLink={setIsEditingLink}
            applyLink={applyLink}
            linkInputRef={linkInputRef}
          />
          <EditorContent editor={editor} className="tiptap-editor" />
        </>
      )}

      {outputView === 'html' && (
        <div className="output-view">
          <div className="output-header">
            <h3>HTML Output</h3>
            <button onClick={() => copyToClipboard(htmlOutput)} className="copy-button">
              Copiar
            </button>
          </div>
          <pre>{htmlOutput}</pre>
        </div>
      )}

      {outputView === 'markdown' && (
        <div className="output-view">
          <div className="output-header">
            <h3>Markdown Output</h3>
            <button onClick={() => copyToClipboard(markdownOutput)} className="copy-button">
              Copiar
            </button>
          </div>
          <pre>{markdownOutput}</pre>
        </div>
      )}

      <div className="button-group">
        <button
          onClick={showEditor}
          className={`toggle-button ${outputView === 'editor' ? 'active' : ''}`}
        >
          Editor
        </button>
        <button
          onClick={showHtml}
          className={`toggle-button ${outputView === 'html' ? 'active' : ''}`}
        >
          Ver HTML
        </button>
        <button
          onClick={showMarkdown}
          className={`toggle-button ${outputView === 'markdown' ? 'active' : ''}`}
        >
          Ver Markdown
        </button>
        {/* Conditionally render Save Document button */}
        {isSignedIn && (
              <> {/* Use a fragment to group buttons if needed */}
                <button
                  onClick={handleSaveDocument}
                  className="toggle-button save-button"
                >
                  Guardar Documento
                </button>
                <button
                  onClick={handleLoadDocument}
                  className="toggle-button load-button" // Added new class for styling if needed
                >
                  Cargar Documento
                </button>
              </>
        )}
      </div>
    </div>
  );
}
