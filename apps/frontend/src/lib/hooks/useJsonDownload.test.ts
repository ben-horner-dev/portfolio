import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useJsonDownload } from "./useJsonDownload";

describe("useJsonDownload", () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let anchorElement: HTMLAnchorElement;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateObjectURL = vi.fn().mockReturnValue("blob:test-url");
    mockRevokeObjectURL = vi.fn();
    mockClick = vi.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    anchorElement = document.createElement("a");
    anchorElement.click = mockClick;

    vi.spyOn(document, "createElement").mockReturnValue(anchorElement);
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return default filename", () => {
    const { result } = renderHook(() => useJsonDownload());

    expect(result.current.filename).toBe("config");
  });

  it("should use custom default filename", () => {
    const { result } = renderHook(() =>
      useJsonDownload({ defaultFilename: "custom-config" }),
    );

    expect(result.current.filename).toBe("custom-config");
  });

  it("should update filename", () => {
    const { result } = renderHook(() => useJsonDownload());

    act(() => {
      result.current.setFilename("new-filename");
    });

    expect(result.current.filename).toBe("new-filename");
  });

  it("should download JSON data", () => {
    const { result } = renderHook(() => useJsonDownload());
    const testData = { key: "value", nested: { a: 1 } };

    act(() => {
      result.current.downloadJson(testData);
    });

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorElement.href).toBe("blob:test-url");
    expect(anchorElement.download).toBe("config.json");
    expect(mockClick).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });

  it("should use updated filename in download", () => {
    const { result } = renderHook(() => useJsonDownload());

    act(() => {
      result.current.setFilename("my-export");
    });

    act(() => {
      result.current.downloadJson({ test: true });
    });

    expect(anchorElement.download).toBe("my-export.json");
  });
});
