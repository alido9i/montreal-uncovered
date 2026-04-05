"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({
  value,
  onChange,
  placeholder = "Écrivez votre article ici…",
}: RichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // évite les hydration mismatches dans Next.js App Router
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", class: "text-[#FF0033] underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded my-4" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[400px] px-4 py-3 focus:outline-none text-base",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Synchronise le contenu si le parent modifie `value` après montage (ex: édition d'un article existant)
  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border-2 border-gray-200 min-h-[450px] bg-gray-50 animate-pulse" />
    );
  }

  return (
    <div className="border-2 border-gray-200 focus-within:border-black transition-colors bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `px-2.5 py-1 text-xs font-bold border border-transparent hover:bg-gray-100 transition-colors ${
      active ? "bg-black text-white hover:bg-black" : "text-gray-700"
    }`;

  const promptLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const promptImage = () => {
    const url = window.prompt("URL de l'image");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b-2 border-gray-200 px-2 py-1.5 bg-gray-50 sticky top-0 z-10">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
        aria-label="Titre H2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
        aria-label="Titre H3"
      >
        H3
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
        aria-label="Gras"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic")) + " italic"}
        aria-label="Italique"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive("strike")) + " line-through"}
        aria-label="Barré"
      >
        S
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
        aria-label="Liste à puces"
      >
        • Liste
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
        aria-label="Liste numérotée"
      >
        1. Liste
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
        aria-label="Citation"
      >
        &ldquo; Citation
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={promptLink}
        className={btn(editor.isActive("link"))}
        aria-label="Lien"
      >
        🔗 Lien
      </button>
      <button
        type="button"
        onClick={promptImage}
        className={btn(false)}
        aria-label="Image"
      >
        🖼 Image
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={btn(false) + " disabled:opacity-40"}
        aria-label="Annuler"
      >
        ↶
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={btn(false) + " disabled:opacity-40"}
        aria-label="Rétablir"
      >
        ↷
      </button>
    </div>
  );
}
