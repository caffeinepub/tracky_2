import { useDailyQuote } from '../hooks/useDailyQuote';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

export function DailyQuote() {
  const quote = useDailyQuote();

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-accent/20">
      <CardContent className="pt-6 pb-6">
        <div className="flex gap-4">
          <Quote className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <p className="text-lg font-medium leading-relaxed text-foreground italic">
              "{quote.text}"
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              — {quote.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
