using ProjetoFinancas.Classes;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

var persistencia = new Persistencia();
var transacoes = new List<Transacao>();

// Carregar transações de forma síncrona
var task = persistencia.CarregarTransacoes();
task.Wait();
transacoes.AddRange(task.Result);

app.MapGet("/", context =>
{
    return context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "index.html"));
});

app.MapGet("/transacoes", () =>
{
    return Results.Ok(transacoes);
});

app.MapPost("/transacoes", async (Transacao nova) =>
{
    nova.Number = transacoes.Count + 1;
    transacoes.Add(nova);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok(nova);
});

app.MapDelete("/transacoes/{number}", async (int number) =>
{
    var trans = transacoes.FirstOrDefault(t => t.Number == number);
    if (trans == null)
        return Results.NotFound();
    
    transacoes.Remove(trans);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok();
});

app.Run();


