import { Calendar, Edit, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileCard({ profile, formatDate }) {
  if (!profile) return null;

  return (
    <Card className="rounded-2xl shadow-sm border-slate-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName || 'User'}`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                DRIVER
              </Badge>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{profile.phone || "Chưa cập nhật số ĐT"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{profile.email || "Chưa cập nhật email"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tham gia từ {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-full px-4"
              onClick={() => toast.info("Tính năng chỉnh sửa hồ sơ đang được phát triển")}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Chỉnh sửa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
