'use client';

import { Chapter } from '@prisma/client';
import { useEffect, useState } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Grid, Grip, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChapterListProps {
    onReorder: (updatedData: { id: string; position: number }[]) => void;
    onEdit: (id: string) => void;
    items: Chapter[];
}

export const ChapterList = ({ onEdit, onReorder, items }: ChapterListProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [chapters, setChapters] = useState(items);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // re-render the list when the items change
    useEffect(() => {
        setChapters(items);
    }, [items]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return; // dropped outside the list
        }

        const items = Array.from(chapters); // copy the array
        const [reorderedItem] = items.splice(result.source.index, 1); // remove the dragged item
        items.splice(result.destination.index, 0, reorderedItem); // add the dragged item back to the array at the new index

        const startIndex = Math.min(
            result.source.index,
            result.destination.index,
        ); // get the start index
        const endIndex = Math.max(
            result.source.index,
            result.destination.index,
        ); // get the end index

        const updatedChapters = items.slice(startIndex, endIndex + 1); // get the items that were updated (the ones that changed position)

        setChapters(items); // update the state

        const bulkUpdateData = updatedChapters.map((chapter) => ({
            id: chapter.id,
            position: items.findIndex((item) => item.id === chapter.id), // get the new position of the item
            // create the data that will be sent to the server
        }));

        onReorder(bulkUpdateData); // when the user stops dragging, reorder the new positions in the database
    };

    if (!isMounted) {
        return null;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="chapters">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {chapters.map((chapter, index) => (
                            <Draggable
                                key={chapter.id}
                                draggableId={chapter.id}
                                index={index}
                            >
                                {(provided) => (
                                    <div
                                        className={cn(
                                            'mb-4 flex items-center gap-x-2 rounded-md border border-slate-200 bg-slate-200 text-sm text-slate-700',
                                            chapter.isPublished &&
                                                'border-sky-200 bg-sky-100 text-sky-700',
                                        )}
                                        {...provided.draggableProps}
                                        ref={provided.innerRef}
                                    >
                                        <div
                                            className={cn(
                                                'rounded-l-md border-r border-r-slate-200 px-2 py-3 transition hover:bg-slate-300',
                                                chapter.isPublished &&
                                                    'border-r-sky-200 hover:bg-sky-200',
                                            )}
                                            {...provided.dragHandleProps}
                                        >
                                            <Grip className="h-5 w-5" />
                                        </div>
                                        {chapter.title}
                                        <div className="ml-auto flex items-center gap-x-2 pr-2">
                                            {chapter.isFree && (
                                                <Badge>Free</Badge>
                                            )}
                                            <Badge
                                                className={cn(
                                                    'bg-slate-500',
                                                    chapter.isPublished &&
                                                        'bg-sky-700',
                                                )}
                                            >
                                                {chapter.isPublished
                                                    ? 'Published'
                                                    : 'Draft'}
                                            </Badge>
                                            <Pencil
                                                className="h-4 w-4 cursor-pointer transition  hover:opacity-75"
                                                onClick={() =>
                                                    onEdit(chapter.id)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};
