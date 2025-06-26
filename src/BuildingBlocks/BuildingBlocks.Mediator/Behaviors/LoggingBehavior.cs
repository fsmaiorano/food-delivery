namespace BuildingBlocks.Mediator.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        CancellationToken cancellationToken,
        Func<Task<TResponse>> next)
    {
        Console.WriteLine($"[BEHAVIOR] → Executando {typeof(TRequest).Name}");

        if (next == null)
        {
            throw new ArgumentNullException(nameof(next), "The next delegate in the pipeline is null.");
        }

        var response = await next();

        Console.WriteLine($"[BEHAVIOR] ← Finalizado {typeof(TRequest).Name}");
        return response;
    }
}