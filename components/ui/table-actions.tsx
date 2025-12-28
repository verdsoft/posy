"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

interface TableActionsProps {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
    viewLabel?: string
    editLabel?: string
    deleteLabel?: string
    children?: React.ReactNode
}

export function TableActions({
    onView,
    onEdit,
    onDelete,
    viewLabel = "View",
    editLabel = "Edit",
    deleteLabel = "Delete",
    children
}: TableActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {children}
                {onView && (
                    <DropdownMenuItem onClick={onView} className="cursor-pointer text-blue-600 focus:text-blue-600">
                        <Eye className="mr-2 h-4 w-4" />
                        {viewLabel}
                    </DropdownMenuItem>
                )}
                {onEdit && (
                    <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-green-600 focus:text-green-600">
                        <Edit className="mr-2 h-4 w-4" />
                        {editLabel}
                    </DropdownMenuItem>
                )}
                {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deleteLabel}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
