"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
} from "lexical"
import { $createHeadingNode, type HeadingTagType } from "@lexical/rich-text"
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list"
import { $setBlocksType } from "@lexical/selection"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react"

const LowPriority = 1

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [blockType, setBlockType] = useState("paragraph")

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))

      // Detect block type
      const anchorNode = selection.anchor.getNode()
      let element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow()
      const type = element.getType()
      if (type === "heading") {
        // @ts-ignore
        const tag = element.getTag()
        setBlockType(tag)
      } else {
        setBlockType(type)
      }
    }
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, _newEditor) => {
        updateToolbar()
        return false
      },
      LowPriority,
    )
  }, [editor, updateToolbar])

  const formatText = (format: "bold" | "italic" | "underline") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize))
        }
      })
    }
  }

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode())
        }
      })
    }
  }

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  return (
    <div className="toolbar flex items-center gap-2 p-2 border-b bg-white sticky top-0 z-10">
      <Select
        value={blockType}
        onValueChange={(value) => {
          switch (value) {
            case "paragraph":
              formatParagraph()
              break
            case "h1":
              formatHeading("h1")
              break
            case "h2":
              formatHeading("h2")
              break
            case "h3":
              formatHeading("h3")
              break
          }
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      <Button variant={isBold ? "default" : "ghost"} size="sm" onClick={() => formatText("bold")}>
        <Bold className="h-4 w-4" />
      </Button>

      <Button variant={isItalic ? "default" : "ghost"} size="sm" onClick={() => formatText("italic")}>
        <Italic className="h-4 w-4" />
      </Button>

      <Button variant={isUnderline ? "default" : "ghost"} size="sm" onClick={() => formatText("underline")}>
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="sm" onClick={formatBulletList}>
        <List className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={formatNumberedList}>
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  )
}
