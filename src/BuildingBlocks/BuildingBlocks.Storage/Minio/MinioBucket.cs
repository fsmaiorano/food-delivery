using Minio;
using Minio.DataModel.Args;

namespace BuildingBlocks.Storage.Minio;

public sealed record MinioBucket
{
    private const string BucketName = "food-delivery";
    
    public static async Task<(string objectName, string objectUrl)> SendImageAsync(string imageUrl)
    {
        var minio = await CreateMinioClient();

        var fileExtension = Path.GetExtension(imageUrl);
        var objectName = $"{Guid.NewGuid()}{fileExtension}";

        try
        {
            using var httpClient = CreateHttpClient();
            string contentType;
            
            try
            {
                using var headResponse = await httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Head, imageUrl));
                headResponse.EnsureSuccessStatusCode();
                contentType = headResponse.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
            }
            catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.MethodNotAllowed)
            {
                using var getResponse = await httpClient.GetAsync(imageUrl, HttpCompletionOption.ResponseHeadersRead);
                getResponse.EnsureSuccessStatusCode();
                contentType = getResponse.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
            }

            using var response = await httpClient.GetAsync(imageUrl);
            response.EnsureSuccessStatusCode();
            await using var imageStream = await response.Content.ReadAsStreamAsync();

            var found = await minio.BucketExistsAsync(new BucketExistsArgs().WithBucket(BucketName));
            if (!found)
                await minio.MakeBucketAsync(new MakeBucketArgs().WithBucket(BucketName));

            await minio.PutObjectAsync(new PutObjectArgs()
                .WithBucket(BucketName)
                .WithObject(objectName)
                .WithStreamData(imageStream)
                .WithObjectSize(response.Content.Headers.ContentLength ?? -1)
                .WithContentType(contentType));

            Console.WriteLine($"Imagem '{objectName}' enviada para MinIO com sucesso!");

            var objectUrl = await GetImageAsync(objectName);
            return (objectName, objectUrl)!;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Erro: {e.Message}");
            return (string.Empty, string.Empty);
        }
    }

    public static async Task<string?> GetImageAsync(string imageName)
    {
        var minio = await CreateMinioClient();
        
        try
        {
            var presignedUrl = await minio.PresignedGetObjectAsync(new PresignedGetObjectArgs()
                .WithBucket(BucketName)
                .WithObject(imageName)
                .WithExpiry(60 * 60)); // URL válida por 1 hora

            Console.WriteLine($"URL temporária: {presignedUrl}");
            return presignedUrl;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Erro ao baixar arquivo: {e.Message}");
            return string.Empty;
        }
    }

    public static async Task<string> GetImageToDownload(string imageName)
    {
        var minio = await CreateMinioClient();

        try
        {
            var presignedUrl = await minio.PresignedGetObjectAsync(new PresignedGetObjectArgs()
                .WithBucket(BucketName)
                .WithObject(imageName)
                .WithExpiry(60 * 60) // URL valid for 1 hour
                .WithHeaders(new Dictionary<string, string>
                {
                    ["response-content-disposition"] = $"attachment; filename=\"{imageName}\""
                }));

            Console.WriteLine($"Download URL: {presignedUrl}");
            return presignedUrl;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error generating download URL: {e.Message}");
            return string.Empty;
        }
    }
    
    public static async Task DeleteImageAsync(string imageName)
    {
        var minio = await CreateMinioClient();
        

        try
        {
            await minio.RemoveObjectAsync(new RemoveObjectArgs()
                .WithBucket(BucketName)
                .WithObject(imageName));

            Console.WriteLine($"Imagem '{imageName}' removida com sucesso!");
        }
        catch (Exception e)
        {
            Console.WriteLine($"Erro ao remover imagem: {e.Message}");
        }
    }

    private static HttpClient CreateHttpClient()
    {
        return new HttpClient();
    }

    private static Task<IMinioClient> CreateMinioClient()
    {
        var minio = new MinioClient()
            .WithEndpoint("localhost:9000")
            .WithCredentials("admin", "admin123")
            .Build();

        return Task.FromResult<IMinioClient>(minio);
    }
}