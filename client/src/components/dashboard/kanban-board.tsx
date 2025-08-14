import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
};

export function KanbanBoard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimatedSessions: 1
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => apiRequest('POST', '/api/tasks', taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsCreateDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', estimatedSessions: 1 });
      toast({
        title: "Task created",
        description: "Your new task has been added to the board",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create task",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Task>) =>
      apiRequest('PATCH', `/api/tasks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest('DELETE', `/api/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: "Task has been removed from the board",
      });
    }
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description || null,
      status: 'todo',
      priority: newTask.priority,
      estimatedSessions: newTask.estimatedSessions,
    });
  };

  const moveTask = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task: Task) => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Tasks</h3>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Estimated sessions"
                  value={newTask.estimatedSessions}
                  onChange={(e) => setNewTask({ ...newTask, estimatedSessions: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              <Button 
                onClick={handleCreateTask} 
                className="w-full"
                disabled={createTaskMutation.isPending || !newTask.title.trim()}
              >
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className={`rounded-lg p-4 min-h-[300px] ${column.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">{column.title}</h4>
              <Badge variant="secondary">
                {getTasksByStatus(column.id).length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task: Task) => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {task.title}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        {task.priority && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${task.priority ? priorityColors[task.priority as keyof typeof priorityColors] : priorityColors.medium}`}
                          >
                            {task.priority || 'medium'}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {task.description && (
                    <CardContent className="pt-0 pb-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    </CardContent>
                  )}
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {task.completedSessions || 0}/{task.estimatedSessions || 1} sessions
                      </span>
                      <div className="flex space-x-1">
                        {column.id !== 'todo' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => moveTask(task.id, 'todo')}
                          >
                            To Do
                          </Button>
                        )}
                        {column.id !== 'inprogress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => moveTask(task.id, 'inprogress')}
                          >
                            Progress
                          </Button>
                        )}
                        {column.id !== 'done' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => moveTask(task.id, 'done')}
                          >
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}