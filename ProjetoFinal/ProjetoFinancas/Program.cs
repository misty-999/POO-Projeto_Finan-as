// Program.cs: entrypoint do backend. Define endpoints HTTP simples (minimal APIs)
// - /registar : regista novo utilizador (Username + Password)
// - /login    : autentica por Username + Password
// - /categorias (GET/POST/PUT) : listar, criar e editar categorias
// - /transacoes (GET/POST/PUT/DELETE) : CRUD basico de transacoes
// Persistencia: usa a classe Persistencia para ler/gravar ficheiros JSON em wwwroot/data/
// Nota de seguranca: senhas sao comparadas em texto plano neste exemplo - nao usar em producao.
using Microsoft.AspNetCore.Identity;
using ProjetoFinancas.Classes;
var passwordHasher = new PasswordHasher<Utilizador>();

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

var persistencia = new Persistencia();
var transacoes = new List<Transacao>();
var utilizadores = new List<Utilizador>();
var categorias = new List<Categoria>();

// Função auxiliar para verificar administrador
bool EhAdmin(int userId) =>
    utilizadores.FirstOrDefault(u => u.Id == userId)?.UserType?.Equals("admin", StringComparison.OrdinalIgnoreCase) == true;

// Carregar dados de forma sincrona
var taskTransacoes = persistencia.CarregarTransacoes();
taskTransacoes.Wait();
transacoes.AddRange(taskTransacoes.Result);

var taskUtilizadores = persistencia.CarregarUtilizadores();
taskUtilizadores.Wait();
utilizadores.AddRange(taskUtilizadores.Result);

var taskCategorias = persistencia.CarregarCategorias();
taskCategorias.Wait();
categorias.AddRange(taskCategorias.Result);
// Criar um administrador predefinido se não existir
if (!utilizadores.Any(u => u.UserType == "admin"))
{
    var admin = new Utilizador
    {
        Id = utilizadores.Any() ? utilizadores.Max(u => u.Id) + 1 : 1,
        Username = "admin",
        UserType = "admin"
    };

    // Hash the default password ONCE
    admin.PasswordHash = passwordHasher.HashPassword(admin, "admin");

    utilizadores.Add(admin);
    persistencia.GuardarUtilizadores(utilizadores).Wait();
}


// Se nao houver categorias guardadas, criar algumas por defeito
if (!categorias.Any())
{
    categorias.AddRange(new[]
    {
        new Categoria { Id = 1, Nome = "Alimentação", Descricao = "Despesas com alimentação" },
        new Categoria { Id = 2, Nome = "Transporte", Descricao = "Despesas com transporte" },
        new Categoria { Id = 3, Nome = "Moradia", Descricao = "Despesas com moradia" },
        new Categoria { Id = 4, Nome = "Lazer", Descricao = "Despesas com lazer" },
        new Categoria { Id = 5, Nome = "Saúde", Descricao = "Despesas com saúde" }
    });

    persistencia.GuardarCategorias(categorias).Wait();
}

app.MapGet("/", context =>
{
    return context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "index.html"));
});

// Endpoint: registar novo utilizador
// Recebe JSON com um Utilizador (Username, Password, Perfil). Verifica unicidade do Username,
// adiciona a lista em memoria e grava em utilizadores.json.

// OLD
// app.MapPost("/registar", async (Utilizador novo) =>
// {
//     if (utilizadores.Any(u => u.Username == novo.Username))
//         return Results.BadRequest("Utilizador ja existe");
//
//     novo.Id = utilizadores.Count + 1;
//     
//     // Hash the password
//     novo.PasswordHash = passwordHasher.HashPassword(novo, novo.PasswordHash);
//     
//     utilizadores.Add(novo);
//     await persistencia.GuardarUtilizadores(utilizadores);
//     return Results.Ok(novo);
// });
// End OLD

app.MapPost("/registar", async (RegisterRequest request) =>
{
    if (utilizadores.Any(u => u.Username == request.Username))
        return Results.BadRequest("Utilizador ja existe");

    var novo = new Utilizador
    {
        Id = utilizadores.Count + 1,
        Username = request.Username,
        UserType = request.UserType,
        PasswordHash = passwordHasher.HashPassword(null!, request.Password)
    };

    utilizadores.Add(novo);
    await persistencia.GuardarUtilizadores(utilizadores);

    return Results.Ok();
});



// Endpoint: login
// Recebe LoginRequest (Username, Password). Procura utilizador na lista carregada da persistencia.
// Retorna 200 com dados minimos do utilizador ou 401 se as credenciais falharem.
// Nota: para producao, comparar hashes em vez de texto simples e devolver um token/cookie.

// OLD
// app.MapPost("/login", (LoginRequest request) =>
// {
//     var user = utilizadores
//         .Where(u => u.Username == request.Username && u.PasswordHash == request.Password)
//         .OrderByDescending(u => u.UserType.Equals("admin", StringComparison.OrdinalIgnoreCase)) // prioriza admin quando houver duplicados
//         .FirstOrDefault();
//     if (user == null)
//         return Results.Unauthorized();
//     
//     return Results.Ok(new { id = user.Id, username = user.Username, userType = user.UserType });
// });
//
// // Endpoint: obter todas as transacoes do user logado (em memoria)
// app.MapGet("/transacoes", (int userId) =>
// {
//     var userTransacoes = transacoes
//         .Where(t => t.UserId == userId)
//         .ToList();
//
//     return Results.Ok(userTransacoes);
// });
// End OLD
app.MapPost("/login", (LoginRequest request) =>
{
    var user = utilizadores
        .Where(u => u.Username == request.Username)
        .OrderByDescending(u => u.UserType.Equals("admin", StringComparison.OrdinalIgnoreCase))
        .FirstOrDefault();

    if (user == null)
        return Results.Unauthorized();

    var result = passwordHasher.VerifyHashedPassword(
        user,
        user.PasswordHash,
        request.Password
    );
    
    Console.WriteLine(result);
    Console.WriteLine(request.Password);
    Console.WriteLine(user.PasswordHash);
    
    if (result == PasswordVerificationResult.Failed)
        return Results.Unauthorized();

    return Results.Ok(new
    {
        id = user.Id,
        username = user.Username,
        userType = user.UserType
    });
});



// Endpoint: listar categorias
app.MapGet("/categorias", () => Results.Ok(categorias));

// Endpoint: criar categoria
app.MapPost("/categorias", async (Categoria nova) =>
{
    if (string.IsNullOrWhiteSpace(nova.Nome))
        return Results.BadRequest("Nome da categoria é obrigatório.");

    if (categorias.Any(c => c.Nome.Equals(nova.Nome, StringComparison.OrdinalIgnoreCase)))
        return Results.BadRequest("Já existe uma categoria com esse nome.");

    nova.Id = categorias.Any() ? categorias.Max(c => c.Id) + 1 : 1;
    nova.Descricao = nova.Descricao ?? string.Empty;
    categorias.Add(nova);
    await persistencia.GuardarCategorias(categorias);
    return Results.Ok(nova);
});

// Endpoint: editar categoria
app.MapPut("/categorias/{id}", async (int id, Categoria atualizada) =>
{
    var categoria = categorias.FirstOrDefault(c => c.Id == id);
    if (categoria == null)
        return Results.NotFound();

    if (string.IsNullOrWhiteSpace(atualizada.Nome))
        return Results.BadRequest("Nome da categoria é obrigatório.");

    if (categorias.Any(c => c.Id != id && c.Nome.Equals(atualizada.Nome, StringComparison.OrdinalIgnoreCase)))
        return Results.BadRequest("Já existe uma categoria com esse nome.");

    categoria.Nome = atualizada.Nome;
    categoria.Descricao = atualizada.Descricao ?? string.Empty;

    await persistencia.GuardarCategorias(categorias);
    return Results.Ok(categoria);
});

// Endpoint: criar transacao
// Recebe um objeto Transacao (name, amount, date, type, category). Atribui Number e grava.
// Endpoint: obter todas as transacoes do user logado (em memoria)
app.MapGet("/transacoes", (int userId) =>
{
    var userTransacoes = transacoes
        .Where(t => t.UserId == userId)
        .ToList();

    return Results.Ok(userTransacoes);
});

app.MapPost("/transacoes", async (Transacao nova) =>
{
    // Validar valor positivo
    if (nova.Amount <= 0)
        return Results.BadRequest("O valor da transação deve ser positivo (> 0).");
    
    // Validar categoria
    if (!categorias.Any(c => c.Nome.Equals(nova.Category, StringComparison.OrdinalIgnoreCase)))
        return Results.BadRequest("Categoria inválida. Escolha uma das existentes.");
    
    // Validar tipo
    if (nova.Type != "Receita" && nova.Type != "Despesa")
        return Results.BadRequest("Tipo inválido. Use 'Receita' ou 'Despesa'.");

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
    
    // Validar categoria
    if (!categorias.Any(c => c.Nome.Equals(atualizada.Category, StringComparison.OrdinalIgnoreCase)))
        return Results.BadRequest("Categoria inválida. Escolha uma das existentes.");
    
    // Validar tipo
    if (atualizada.Type != "Receita" && atualizada.Type != "Despesa")
        return Results.BadRequest("Tipo inválido. Use 'Receita' ou 'Despesa'.");

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

// ===== Endpoints de Administração de Utilizadores =====
// Apenas administradores podem listar ou remover utilizadores

app.MapGet("/utilizadores", (int adminId) =>
{
    if (!EhAdmin(adminId)) return Results.Unauthorized();
    return Results.Ok(utilizadores);
});

app.MapDelete("/utilizadores/{id}", async (int id, int adminId) =>
{
    if (!EhAdmin(adminId)) return Results.Unauthorized();

    var user = utilizadores.FirstOrDefault(u => u.Id == id);
    if (user == null) return Results.NotFound();
    if (user.UserType.Equals("admin", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest("Não é possível eliminar outro administrador.");

    // Remover transações associadas
    transacoes = transacoes.Where(t => t.UserId != id).ToList();
    utilizadores.Remove(user);

    await persistencia.GuardarUtilizadores(utilizadores);
    await persistencia.GuardarTransacoes(transacoes);

    return Results.Ok();
});

app.Run();
