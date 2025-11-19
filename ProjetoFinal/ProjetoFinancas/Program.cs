using ProjetoFinancas.Classes;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

var persistencia = new Persistencia();
var transacoes = new List<Transacao>();
var utilizadores = new List<Utilizador>();

// Carregar dados de forma síncrona
var taskTransacoes = persistencia.CarregarTransacoes();
taskTransacoes.Wait();
transacoes.AddRange(taskTransacoes.Result);

var taskUtilizadores = persistencia.CarregarUtilizadores();
taskUtilizadores.Wait();
utilizadores.AddRange(taskUtilizadores.Result);

app.MapGet("/", context =>
{
    return context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "index.html"));
});

app.MapPost("/registar", async (Utilizador novo) =>
{
    if (utilizadores.Any(u => u.Username == novo.Username))
        return Results.BadRequest("Utilizador já existe");
    
    novo.Id = utilizadores.Count + 1;
    utilizadores.Add(novo);
    await persistencia.GuardarUtilizadores(utilizadores);
    return Results.Ok(novo);
});

app.MapPost("/login", (LoginRequest request) =>
{
    var user = utilizadores.FirstOrDefault(u => u.Username == request.Username && u.Password == request.Password);
    if (user == null)
        return Results.Unauthorized();
    
    return Results.Ok(new { id = user.Id, username = user.Username });
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

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
