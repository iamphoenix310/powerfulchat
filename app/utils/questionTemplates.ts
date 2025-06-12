const questionTemplates: Record<string, string[]> = {
  // ✅ Actors & Actresses
  "Actor": [
    "What is the most popular movie of [celebrityName]?",
    "Has [celebrityName] won any awards?",
    "What was the breakthrough role for [celebrityName]?",
    "What is [celebrityName]’s highest-grossing film?",
    "Has [celebrityName] worked with [Director] before?",
    "What are some iconic roles played by [celebrityName]?",
    "Is [celebrityName] known for any specific acting style?"
  ],
  "Actress": [
    "What is the most popular movie of [celebrityName]?",
    "Has [celebrityName] won any awards?",
    "What was the breakthrough role for [celebrityName]?",
    "What is [celebrityName]’s highest-grossing film?",
    "Has [celebrityName] worked with [Director] before?",
    "What are some iconic roles played by [celebrityName]?",
    "Is [celebrityName] known for any specific acting style?"
  ],

  // ✅ Directors
  "Director": [
    "What are the most famous films directed by [celebrityName]?",
    "Has [celebrityName] won an Oscar?",
    "What is the signature style of [celebrityName]?",
    "Which actors frequently work with [celebrityName]?",
    "What is [celebrityName]’s most critically acclaimed film?",
    "Has [celebrityName] ever acted in their own movies?",
    "Which film genres does [celebrityName] specialize in?",
    "What are [celebrityName]’s upcoming projects?"
  ],

  // ✅ Producers
  "Producer": [
    "What are the most famous movies produced by [celebrityName]?",
    "Has [celebrityName] won any producing awards?",
    "Which film studios has [celebrityName] worked with?",
    "What is [celebrityName]’s role in the filmmaking process?",
    "Has [celebrityName] collaborated with [Director] before?",
    "How does [celebrityName] choose projects to produce?",
    "What challenges has [celebrityName] faced in film production?"
  ],

  // ✅ Singers
  "Singer": [
    "What are the most famous songs by [celebrityName]?",
    "Has [celebrityName] won any music awards?",
    "What is [celebrityName]’s vocal range?",
    "When did [celebrityName] release their first album?",
    "Has [celebrityName] performed at major music festivals?",
    "What genre does [celebrityName] usually sing?",
    "Which artists has [celebrityName] collaborated with?",
    "Does [celebrityName] write their own music?"
  ],

  // ✅ Songwriters
  "Songwriter": [
    "What are some hit songs written by [celebrityName]?",
    "Has [celebrityName] won any songwriting awards?",
    "Which artists has [celebrityName] written songs for?",
    "Does [celebrityName] also perform their own songs?",
    "What inspires [celebrityName]’s songwriting?",
    "Has [celebrityName] worked with famous music producers?",
    "What is [celebrityName]’s songwriting process?"
  ],

  // ✅ Authors
  "Author": [
    "What are the best-selling books by [celebrityName]?",
    "Has [celebrityName] won any literary awards?",
    "What genre does [celebrityName] usually write?",
    "What inspired [celebrityName] to start writing?",
    "Has [celebrityName] written any screenplays?",
    "Are there any movies based on books by [celebrityName]?",
    "What is [celebrityName]’s most famous novel?",
    "Does [celebrityName] write under a pen name?"
  ],

  // ✅ Screenwriters
  "Screenwriter": [
    "What are the most famous scripts written by [celebrityName]?",
    "Has [celebrityName] won any screenwriting awards?",
    "What is [celebrityName]’s writing process like?",
    "Which directors has [celebrityName] frequently worked with?",
    "Has [celebrityName] ever directed a film?",
    "What genres does [celebrityName] specialize in?",
    "Has [celebrityName] written any books or novels?"
  ],

  // ✅ Cinematographers
  "Cinematographer": [
    "What are the most visually stunning films shot by [celebrityName]?",
    "Has [celebrityName] won any cinematography awards?",
    "What is [celebrityName]’s signature visual style?",
    "Which directors does [celebrityName] frequently collaborate with?",
    "What type of camera equipment does [celebrityName] prefer?",
    "How does [celebrityName] achieve unique lighting techniques?"
  ],

  // ✅ Film Editors
  "Editor": [
    "Which movies have been edited by [celebrityName]?",
    "Has [celebrityName] won any film editing awards?",
    "What is [celebrityName]’s approach to film editing?",
    "Which directors has [celebrityName] worked with?",
    "How does [celebrityName] handle pacing in films?",
    "Has [celebrityName] worked on both action and drama films?"
  ],

  // ✅ Composers
  "Composer": [
    "What are the most famous film scores composed by [celebrityName]?",
    "Has [celebrityName] won any music composition awards?",
    "What instruments does [celebrityName] use in their scores?",
    "Which directors does [celebrityName] frequently work with?",
    "Has [celebrityName] composed music for TV shows as well?",
    "What is [celebrityName]’s most iconic soundtrack?"
  ],

  // ✅ Costume Designers
  "Costume Designer": [
    "Which films feature costumes designed by [celebrityName]?",
    "Has [celebrityName] won any costume design awards?",
    "What is [celebrityName]’s signature design style?",
    "How does [celebrityName] research historical costumes for films?",
    "Has [celebrityName] designed costumes for theater productions?",
    "Which actors has [celebrityName] worked closely with?"
  ],

  // ✅ Film Critics & Historians
  "Film Critic": [
    "What are [celebrityName]’s most famous movie reviews?",
    "Has [celebrityName] written any books on cinema?",
    "Which film genres does [celebrityName] specialize in analyzing?",
    "What is [celebrityName]’s take on modern cinema trends?",
    "Does [celebrityName] have a favorite director?",
    "Has [celebrityName] ever worked in the film industry?"
  ],

  // ✅ Stunt Coordinators & Performers
  "Stunt Coordinator": [
    "What are the most famous action scenes choreographed by [celebrityName]?",
    "Has [celebrityName] won any stunt performance awards?",
    "Which actors has [celebrityName] trained for action roles?",
    "What safety measures does [celebrityName] use on set?",
    "Has [celebrityName] ever directed an action sequence?",
    "What films showcase [celebrityName]’s best stunt work?"
  ],
};

export default questionTemplates;