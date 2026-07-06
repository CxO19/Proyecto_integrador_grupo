export class UpdateRuleDto {
  ruleName?: string;
  categoryA?: string;
  categoryB?: string;
  fieldA?: string;
  fieldB?: string;
  operator?: 'must_match' | 'must_not_exceed';
  errorMessage?: string;
}