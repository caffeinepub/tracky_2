import { useState } from 'react';
import { useChapters, useCreateChapter, useEditChapter, useDeleteChapter, useMarkChapterAsCompleted, useMarkChapterAsIncomplete } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookOpen, Plus, Edit2, Trash2, Loader2, Save, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SyllabusChapter } from '../lib/types';

export function ChapterManager() {
  const { data: chapters, isLoading } = useChapters();
  const createChapter = useCreateChapter();
  const editChapter = useEditChapter();
  const deleteChapter = useDeleteChapter();
  const markCompleted = useMarkChapterAsCompleted();
  const markIncomplete = useMarkChapterAsIncomplete();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', subject: '', notes: '' });

  // Calculate progress statistics
  const totalChapters = chapters?.length || 0;
  const completedChapters = chapters?.filter(c => c.completed).length || 0;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createChapter.mutateAsync({
        title: formData.title,
        subject: formData.subject,
        notes: formData.notes,
      });
      toast.success('Chapter created successfully');
      setFormData({ title: '', subject: '', notes: '' });
      setIsAdding(false);
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const handleEdit = async (chapterId: string) => {
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await editChapter.mutateAsync({
        chapterId,
        title: formData.title,
        subject: formData.subject,
        notes: formData.notes,
      });
      toast.success('Chapter updated successfully');
      setFormData({ title: '', subject: '', notes: '' });
      setEditingId(null);
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const handleDelete = async (chapterId: string) => {
    try {
      await deleteChapter.mutateAsync(chapterId);
      toast.success('Chapter deleted successfully');
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const handleToggleComplete = async (chapterId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await markIncomplete.mutateAsync(chapterId);
        toast.success('Chapter marked as incomplete');
      } else {
        await markCompleted.mutateAsync(chapterId);
        toast.success('Chapter marked as completed');
      }
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const startEditing = (chapter: SyllabusChapter) => {
    setEditingId(chapter.id);
    setFormData({
      title: chapter.title,
      subject: chapter.subject,
      notes: chapter.notes || '',
    });
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ title: '', subject: '', notes: '' });
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Syllabus Chapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Syllabus Chapters
            </CardTitle>
            <CardDescription>Organize your study sessions by subject and chapter</CardDescription>
          </div>
          {!isAdding && !editingId && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Report */}
        {totalChapters > 0 && (
          <div className="p-4 border border-border/50 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Progress Report</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{completionPercentage}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {completedChapters} of {totalChapters} chapters completed
              </p>
            </div>
          </div>
        )}

        {(isAdding || editingId) && (
          <div className="p-4 border border-border/50 rounded-lg bg-accent/20 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Calculus"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this chapter..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => (editingId ? handleEdit(editingId) : handleCreate())}
                disabled={createChapter.isPending || editChapter.isPending}
              >
                {(createChapter.isPending || editChapter.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button onClick={cancelEditing} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {chapters && chapters.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`p-4 border border-border/50 rounded-lg bg-gradient-to-br transition-all ${
                    chapter.completed
                      ? 'from-primary/5 to-secondary/5 opacity-75'
                      : 'from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      <Checkbox
                        checked={chapter.completed}
                        onCheckedChange={() => handleToggleComplete(chapter.id, chapter.completed)}
                        disabled={markCompleted.isPending || markIncomplete.isPending}
                        className="h-5 w-5"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className={`font-semibold text-foreground ${chapter.completed ? 'line-through' : ''}`}>
                        {chapter.title}
                      </h4>
                      <p className={`text-sm text-muted-foreground ${chapter.completed ? 'line-through' : ''}`}>
                        {chapter.subject}
                      </p>
                      {chapter.notes && (
                        <p className="text-sm text-muted-foreground/80 mt-2">{chapter.notes}</p>
                      )}
                      {chapter.completed && (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-xs text-primary font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(chapter)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{chapter.title}"? This action cannot be undone.
                              Sessions associated with this chapter will be marked as unassociated.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(chapter.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          !isAdding && (
            <div className="text-center py-12 space-y-2">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No chapters yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first chapter to organize your study sessions
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
