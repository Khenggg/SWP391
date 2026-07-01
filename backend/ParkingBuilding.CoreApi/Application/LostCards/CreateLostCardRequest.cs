namespace ParkingBuilding.CoreApi.Application.LostCards
{
    public class CreateLostCardRequest
    {
        public long SessionId { get; set; }
        public string? ReporterName { get; set; }
        public string? Phone { get; set; }
        public string? VerificationNote { get; set; } // Tương ứng verification_note
        public string? Reason { get; set; }
        public decimal LostCardFee { get; set; }

        // Bạn có thể thêm danh sách tài liệu nếu cần upload kèm lúc tạo
        // public List<DocumentDto> Documents { get; set; }
    }
}