export class Quiz{
    question: string;
    choices: string[];
    answer: string;

constructor(question: string, choices: string[], answer: string) {
    if (choices.length !== 4) {
      throw new Error("There must be exactly 4 choices.");
    }

    this.question = question;
    this.choices = choices;
    this.answer = answer;
  }

  // display(): void {
  //   console.log(`Question: ${this.question}`);
  //   this.choices.forEach((choice, index) => {
  //     console.log(`${index + 1}. ${choice}`);
  //   });
  //   console.log(this.answer);
  // }
}