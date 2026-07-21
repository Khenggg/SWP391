using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var client = new HttpClient();
        var content = new StringContent("{ \"username\": \"staff01\", \"password\": \"123456\" }", Encoding.UTF8, "application/json");
        var res = await client.PostAsync("http://localhost:5000/api/core/auth/login", content);
        var json = await res.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var token = doc.RootElement.GetProperty("data").GetProperty("accessToken").GetString();
        
        client.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);
        var res2 = await client.GetAsync("http://localhost:5000/api/core/parking-sessions/location-suggestion?vehicleTypeId=5&entryGateId=3");
        var json2 = await res2.Content.ReadAsStringAsync();
        Console.WriteLine(json2);
    }
}
