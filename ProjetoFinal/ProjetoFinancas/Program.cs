// Program.cs: entrypoint do backend. Define endpoints HTTP simples (minimal APIs)
// - /registar : regista novo utilizador (Username + Password)
// - /login    : autentica por Username + Password
// - /transacoes (GET/POST/PUT/DELETE) : CRUD basico de transacoes
// Persistencia: usa a classe Persistencia para ler/gravar ficheiros JSON em wwwroot/data/
// Nota de seguranca: senhas sao comparadas em texto plano neste exemplo - nao usar em producao.
using ProjetoFinancas.Classes;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

var persistencia = new Persistencia();
var transacoes = new List<Transacao>();
var utilizadores = new List<Utilizador>();

// Carregar dados de forma sincrona
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

// Endpoint: registar novo utilizador
// Recebe JSON com um Utilizador (Username, Password, Perfil). Verifica unicidade do Username,
// adiciona a lista em memoria e grava em utilizadores.json.
app.MapPost("/registar", async (Utilizador novo) =>
{
    if (utilizadores.Any(u => u.Username == novo.Username))
        return Results.BadRequest("Utilizador ja existe");

    novo.Id = utilizadores.Count + 1;
    utilizadores.Add(novo);
    await persistencia.GuardarUtilizadores(utilizadores);
    return Results.Ok(novo);

});

// Endpoint: login
// Recebe LoginRequest (Username, Password). Procura utilizador na lista carregada da persistencia.
// Retorna 200 com dados minimos do utilizador ou 401 se as credenciais falharem.
// Nota: para producao, comparar hashes em vez de texto simples e devolver um token/cookie.
app.MapPost("/login", (LoginRequest request) =>
{
    var user = utilizadores.FirstOrDefault(u => u.Username == request.Username && u.Password == request.Password);
    if (user == null)
        return Results.Unauthorized();
    
    return Results.Ok(new { id = user.Id, username = user.Username });
});

// Endpoint: obter todas as transacoes (em memoria)
app.MapGet("/transacoes", () => Results.Ok(transacoes));

// Endpoint: criar transacao
// Recebe um objeto Transacao (name, amount, date, type, category). Atribui Number e grava.
app.MapPost("/transacoes", async (Transacao nova) =>
{
    // Validar valor positivo
    if (nova.Amount <= 0)
        return Results.BadRequest("O valor da transação deve ser positivo (> 0).");

    nova.Number = transacoes.Count + 1;
    transacoes.Add(nova);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok(nova);
});

// Endpoint: editar transacao existente por numero
app.MapPut("/transacoes/{number}", async (int number, Transacao atualizada) =>
{
    var transacaoExistente = transacoes.FirstOrDefault(t => t.Number == number);
    if (transacaoExistente == null) return Results.NotFound();

    // Validar valor positivo
    if (atualizada.Amount <= 0)
        return Results.BadRequest("O valor da transação deve ser positivo (> 0).");

    transacaoExistente.Name = atualizada.Name;
    transacaoExistente.Date = atualizada.Date;
    transacaoExistente.Type = atualizada.Type;
    transacaoExistente.Category = atualizada.Category;
    transacaoExistente.Amount = atualizada.Amount;

    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok(transacaoExistente);
});

// Endpoint: apagar transacao por numero
app.MapDelete("/transacoes/{number}", async (int number) =>
{
    var trans = transacoes.FirstOrDefault(t => t.Number == number);
    if (trans == null) return Results.NotFound();

    transacoes.Remove(trans);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok();
});

app.Run();
