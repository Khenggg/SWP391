namespace ParkingBuilding.CoreApi.Application.LostCards
{
    public class ProcessLostCardRequest
    {
        // Action để biết người dùng muốn Duyệt hay Từ chối
        public Domain.Enums.LostCardCaseStatus Action { get; set; } // Đổi từ string sang Enum

        public string? RejectionReason { get; set; } // Nếu từ chối, cần lý do

        // Nếu trường hợp cần cập nhật phí sau khi duyệt
        public decimal? FinalFee { get; set; }
    }
}