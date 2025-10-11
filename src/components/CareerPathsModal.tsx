import { Download, ExternalLink, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { CareerPath } from '@/types';

interface CareerPathsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  careerPaths: CareerPath[];
}

export default function CareerPathsModal({ open, onOpenChange, careerPaths }: CareerPathsModalProps) {
  const handleDownloadPDF = async (careerPath: CareerPath) => {
    if (careerPath.pdf_url) {
      window.open(careerPath.pdf_url, '_blank');
    } else {
      const content = `
        Career Path: ${careerPath.title}

        Description:
        ${careerPath.description}

        Generated: ${formatDate(careerPath.created_at)}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${careerPath.title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Career Roadmaps</DialogTitle>
          <DialogDescription>
            All your generated career paths and learning roadmaps
          </DialogDescription>
        </DialogHeader>

        {careerPaths.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No career paths generated yet</p>
            <p className="text-sm text-gray-400">Start chatting with the AI mentor to create your first roadmap!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {careerPaths.map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{path.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(path.created_at)}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(path)}
                      className="ml-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {path.description && (
                    <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                  )}

                  {path.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden border">
                      <img
                        src={path.image_url}
                        alt={path.title}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {path.roadmap_data?.milestones && path.roadmap_data.milestones.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Key Milestones:</h4>
                      <div className="space-y-2">
                        {path.roadmap_data.milestones.slice(0, 3).map((milestone: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Badge variant="secondary" className="mt-0.5">
                              {idx + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{milestone.title}</p>
                              {milestone.duration && (
                                <p className="text-xs text-gray-500">{milestone.duration}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
