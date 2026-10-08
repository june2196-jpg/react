import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });

  it('500자를 초과하면 오류를 안내하고 생성을 막는다', () => {
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '가'.repeat(501) } });

    expect(screen.getByText('500자를 초과할 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('프롬프트 히스토리를 다시 입력에 적용할 수 있다', async () => {
    const user = userEvent.setup();
    render(
      <PromptInput
        onGenerate={vi.fn()}
        isLoading={false}
        history={['대시보드 카드 만들어줘']}
      />,
    );

    await user.click(screen.getByRole('button', { name: '대시보드 카드 만들어줘' }));

    expect(screen.getByRole('textbox')).toHaveValue('대시보드 카드 만들어줘');
  });
});
