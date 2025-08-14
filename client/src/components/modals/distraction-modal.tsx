import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DistractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

export function DistractionModal({ isOpen, onClose, sessionId }: DistractionModalProps) {
  const [description, setDescription] = useState("");
  const [type, setType] = useState("phone");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createDistractionMutation = useMutation({
    mutationFn: (distraction: { sessionId: string; description: string }) =>
      apiRequest('POST', '/api/distractions', distraction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: "Distraction logged",
        description: "Keep focusing! You've got this.",
      });
      onClose();
      setDescription("");
      setType("phone");
    },
  });

  const handleSave = () => {
    if (!sessionId) {
      toast({
        title: "No active session",
        description: "Start a timer session first to log distractions.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what distracted you.",
        variant: "destructive",
      });
      return;
    }

    createDistractionMutation.mutate({
      sessionId,
      description: `${type}: ${description}`,
    });
  };

  const distractionTypes = [
    { value: "phone", label: "Phone notification" },
    { value: "email", label: "Email" },
    { value: "colleague", label: "Colleague interruption" },
    { value: "thought", label: "Internal thought" },
    { value: "noise", label: "Noise" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Distraction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {distractionTypes.map((distType) => (
                  <SelectItem key={distType.value} value={distType.value}>
                    {distType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What distracted you?"
            />
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={createDistractionMutation.isPending}
            >
              {createDistractionMutation.isPending ? "Logging..." : "Log It"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
