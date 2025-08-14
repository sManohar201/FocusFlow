import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Clock, Edit2, Trash2, Check, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task } from "@shared/schema";

export function TasksKanban() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    estimatedSessions: 1,
  });

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      apiRequest('POST', '/api/tasks', task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsCreateDialogOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", estimatedSessions: 1 });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Task>) =>
      apiRequest('PATCH', `/api/tasks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/tasks/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    createTaskMutation.mutate({
      ...newTask,
      status: 'todo',
      completedSessions: 0,
    });
  };

  const handleStatusChange = (taskId: string, status: 'todo' | 'inprogress' | 'done') => {
    updateTaskMutation.mutate({ id: taskId, status });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
      case 'inprogress': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
      case 'done': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
      default: return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    inprogress: tasks.filter(t => t.status === 'inprogress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const columnConfig = [
    { status: 'todo', title: 'To Do', color: 'bg-slate-400', count: tasksByStatus.todo.length },
    { status: 'inprogress', title: 'In Progress', color: 'bg-blue-500', count: tasksByStatus.inprogress.length },
    { status: 'done', title: 'Done', color: 'bg-green-500', count: tasksByStatus.done.length },
  ];

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTask.priority} onValueChange={(value: "low" | "medium" | "high") => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Estimated Sessions</label>
                  <Input
                    type="number"
                    min="1"
                    value={newTask.estimatedSessions}
                    onChange={(e) => setNewTask({ ...newTask, estimatedSessions: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columnConfig.map((column) => (
          <div key={column.status} className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${column.color} rounded-full`}></div>
              <h4 className="font-medium text-sm">{column.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor('low')}`}>
                {column.count}
              </span>
            </div>
            
            {/* Task Cards */}
            <div className="space-y-3">
              {tasksByStatus[column.status as keyof typeof tasksByStatus].map((task) => (
                <div
                  key={task.id}
                  className={`rounded-lg p-4 border cursor-move hover:shadow-md transition-shadow ${getColumnColor(task.status)}`}
                  draggable
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-sm">{task.title}</h5>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority!)}`}>
                        {task.priority}
                      </span>
                      {task.status === 'done' && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimatedSessions} sessions</span>
                    </div>
                    
                    {task.status === 'inprogress' ? (
                      <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                        <Play className="w-3 h-3" />
                        <span>Active session</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => {
                            const nextStatus = task.status === 'todo' ? 'inprogress' : 
                                             task.status === 'inprogress' ? 'done' : 'todo';
                            handleStatusChange(task.id, nextStatus);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
