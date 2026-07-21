using System.Collections.Generic;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.LostCards;

public interface ILostCardService
{
    Task<LostCardCase> CreateLostCardCaseAsync(CreateLostCardRequest request, long staffId);
    Task<LostCardCase> ProcessLostCardCaseAsync(long caseId, ProcessLostCardRequest request, long userId);
    Task<(List<LostCardCase> Items, int TotalItems, int TotalPages)> GetListAsync(string? status, string? keyword, int page, int pageSize);
    Task<LostCardCase> GetDetailAsync(long caseId);
}