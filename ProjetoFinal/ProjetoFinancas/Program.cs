// Program.cs: entrypoint do backend. Define endpoints HTTP simples (minimal APIs)
// - /registar : regista novo utilizador (Nome + Senha)
// - /login    : autentica por Nome + Senha
// - /transacoes (GET/POST/DELETE) : CRUD básico de transações
// Persistência: usa a classe Persistencia para ler/gravar ficheiros JSON em wwwroot/data/
// Nota de segurança: senhas são comparadas em texto plano neste exemplo — não usar em produção.
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

// Endpoint: registar novo utilizador
// Recebe JSON com um Utilizador (Nome, Senha, Perfil). Verifica unicidade do Nome,
// adiciona à lista em memória e grava em utilizadores.json.
app.MapPost("/registar", async (Utilizador novo) =>
{
<<<<<<< HEAD
    if (utilizadores.Any(u => u.Nome == novo.Nome))
        return Results.BadRequest("Nome já existe");

=======
    if (utilizadores.Any(u => u.Username == novo.Username))
        return Results.BadRequest("Utilizador já existe");
    
>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
    novo.Id = utilizadores.Count + 1;
    utilizadores.Add(novo);
    await persistencia.GuardarUtilizadores(utilizadores);
    return Results.Ok(novo);
});

// Endpoint: login
// Recebe LoginRequest (Nome, Senha). Procura utilizador na lista carregada da persistência.
// Retorna 200 com dados mínimos do utilizador ou 401 se as credenciais falharem.
// Nota: para produção, comparar hashes em vez de texto simples e devolver um token/cookie.
app.MapPost("/login", (LoginRequest request) =>
{
<<<<<<< HEAD
    var user = utilizadores.FirstOrDefault(u => u.Nome == request.Nome && u.Senha == request.Senha);
=======
    var user = utilizadores.FirstOrDefault(u => u.Username == request.Username && u.Password == request.Password);
>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
    if (user == null)
        return Results.Unauthorized();
    
    return Results.Ok(new { id = user.Id, username = user.Username });
});

// Endpoint: obter todas as transações (em memória)
app.MapGet("/transacoes", () => Results.Ok(transacoes));

// Endpoint: criar transação
// Recebe um objeto Transacao (name, amount, date, type, category). Atribui Number e grava.
app.MapPost("/transacoes", async (Transacao nova) =>
{
    nova.Number = transacoes.Count + 1;
    transacoes.Add(nova);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok(nova);
});

// Endpoint: apagar transação por número
app.MapDelete("/transacoes/{number}", async (int number) =>
{
    var trans = transacoes.FirstOrDefault(t => t.Number == number);
    if (trans == null) return Results.NotFound();

    transacoes.Remove(trans);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok();
});

app.Run();

<<<<<<< HEAD
=======
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
