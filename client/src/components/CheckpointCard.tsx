import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Using type-only import for better TypeScript compliance
import type { CodeCheckpoint } from '../../../server/src/schema';

interface CheckpointCardProps {
  checkpoint: CodeCheckpoint;
  onCopy: (text: string) => void;
  showExpanded?: boolean;
}

export function CheckpointCard({ checkpoint, onCopy, showExpanded = false }: CheckpointCardProps) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(showExpanded);

  const handleCopy = async (text: string, type: string) => {
    try {
      await onCopy(text);
      setCopyFeedback(`${type} copied to clipboard! ✅`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (error) {
      setCopyFeedback(`Failed to copy ${type.toLowerCase()} ❌`);
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getLanguageEmoji = (language: string): string => {
    const emojiMap: { [key: string]: string } = {
      'JavaScript': '🟨',
      'TypeScript': '🔷',
      'Python': '🐍',
      'Java': '☕',
      'C++': '⚡',
      'C#': '🔷',
      'Go': '🐹',
      'Rust': '🦀',
      'PHP': '🐘',
      'Ruby': '💎',
      'Swift': '🍎',
      'Kotlin': '🎯',
      'HTML': '🌐',
      'CSS': '🎨',
      'SQL': '🗄️'
    };
    return emojiMap[language] || '📄';
  };

  return (
    <Card className="checkpoint-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <span className="text-xl">{getLanguageEmoji(checkpoint.programming_language)}</span>
              {checkpoint.title}
            </CardTitle>
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
              {checkpoint.summary}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="font-medium">
                {checkpoint.programming_language}
              </Badge>
              {checkpoint.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {checkpoint.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{checkpoint.tags.length - 3} more
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                📅 {formatDate(checkpoint.created_at)}
              </p>
              <div className="flex gap-2">
                {!isExpanded && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        👁️ View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-xl">{getLanguageEmoji(checkpoint.programming_language)}</span>
                          {checkpoint.title}
                        </DialogTitle>
                      </DialogHeader>
                      <DetailedView checkpoint={checkpoint} onCopy={handleCopy} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <DetailedView checkpoint={checkpoint} onCopy={handleCopy} />
        </CardContent>
      )}

      {copyFeedback && (
        <div className="mx-6 mb-4">
          <Alert className="border-green-300 bg-green-50">
            <AlertDescription className="text-green-800 text-sm">
              {copyFeedback}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}

interface DetailedViewProps {
  checkpoint: CodeCheckpoint;
  onCopy: (text: string, type: string) => void;
}

function DetailedView({ checkpoint, onCopy }: DetailedViewProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
          📝 Summary
        </h4>
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          {checkpoint.summary}
        </p>
      </div>

      {/* Tags */}
      {checkpoint.tags.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            🏷️ Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {checkpoint.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code">💻 Code</TabsTrigger>
          <TabsTrigger value="feedback">💭 Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="mt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Code Snippet</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCopy(checkpoint.code_snippet, 'Code')}
                className="text-xs"
              >
                📋 Copy Code
              </Button>
            </div>
            <ScrollArea className="h-64 w-full rounded-lg border bg-gray-50 custom-scrollbar">
              <pre className="code-snippet text-xs p-4 whitespace-pre-wrap break-words">
                {checkpoint.code_snippet}
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">User Feedback</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCopy(checkpoint.user_feedback, 'Feedback')}
                className="text-xs"
              >
                📋 Copy Feedback
              </Button>
            </div>
            <ScrollArea className="h-64 w-full rounded-lg border bg-gray-50 custom-scrollbar">
              <div className="p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {checkpoint.user_feedback}
                </p>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}